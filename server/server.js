#!/usr/bin/env node
/*
 * Results Layer server: sign-in, role-checked API for agency updates, audit log.
 * No dependencies. Needs Node 18 or later.
 *
 *   node server/server.js                    start (default http://127.0.0.1:3000)
 *   node server/server.js users              list accounts
 *   node server/server.js adduser EMAIL ROLE [AGENCY] [--name "Full Name"]
 *   node server/server.js passwd EMAIL       change a password (ends that person's sessions)
 *   node server/server.js remove EMAIL       remove an account
 *
 * Settings (environment variables):
 *   PORT              default 3000
 *   HOST              default 127.0.0.1
 *   RL_DATA_DIR       where accounts, updates and the audit log live (default ./var)
 *   RL_TRUST_PROXY=1  behind a TLS proxy: use X-Forwarded-For and X-Forwarded-Proto
 *   RL_REQUIRE_HTTPS=1  redirect plain-HTTP requests to HTTPS (not for localhost)
 *   RL_COOKIE_SECURE=1  always mark the session cookie Secure
 *   RL_IDLE_MIN       idle sign-out in minutes (default 60)
 *   RL_PASSWORD       choose a password for adduser/passwd instead of a generated one
 */
"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var ROOT = path.join(__dirname, "..");
var ROLES = ["admin", "agency", "government", "executive"];
var AGENCIES = ["UNDP", "UNICEF", "WHO", "UNFPA", "UNAIDS", "FAO", "UN Women", "ILO", "IOM", "UNHCR", "UNESCO", "UNODC", "UNEP", "UNIDO", "IFAD", "OHCHR", "RCO"];

/* ---------- small helpers ---------- */
function hashPw(pw, saltHex) {
  return crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 64, { N: 16384, r: 8, p: 1 }).toString("hex");
}
function randomPw() { return crypto.randomBytes(12).toString("base64").replace(/[+/=]/g, "x"); }
function initialsOf(name) { return name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase(); }
function makeUser(roleKey, agency, name, pw) {
  var salt = crypto.randomBytes(16).toString("hex");
  return { name: name, initials: initialsOf(name), roleKey: roleKey, agency: agency || "", salt: salt, hash: hashPw(pw, salt) };
}
function clean(s, max) { return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max); }
function csvLine(line) {
  var out = [], cur = "", q = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c;
  }
  out.push(cur); return out;
}
function loadIndicators(file) {
  var lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  var head = csvLine(lines[0]), map = {};
  var years = head.filter(function (h) { return /^\d{4}$/.test(h); }).map(Number);
  var iu = head.indexOf("unit");
  lines.slice(1).forEach(function (l) { var p = csvLine(l); map[p[0]] = { unit: p[iu] }; });
  return { map: map, years: years };
}

/* ---------- the server ---------- */
function createServer(opts) {
  opts = opts || {};
  var dataDir = opts.dataDir || process.env.RL_DATA_DIR || path.join(ROOT, "var");
  var pagePath = opts.pagePath || path.join(ROOT, "dist", "index.html");
  var fontsDir = path.join(path.dirname(pagePath), "fonts");
  var trustProxy = opts.trustProxy != null ? opts.trustProxy : process.env.RL_TRUST_PROXY === "1";
  var requireHttps = opts.requireHttps != null ? opts.requireHttps : process.env.RL_REQUIRE_HTTPS === "1";
  var secureEnv = opts.secure != null ? opts.secure : process.env.RL_COOKIE_SECURE === "1";
  var idleMs = (opts.idleMin || Number(process.env.RL_IDLE_MIN) || 60) * 60 * 1000;
  var absMs = opts.absMs || 8 * 60 * 60 * 1000;
  var maxFails = opts.maxFails || 5, ipMaxFails = opts.ipMaxFails || 20, failWindow = opts.failWindowMs || 15 * 60 * 1000;
  var quiet = !!opts.quiet;

  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  var USERS_FILE = path.join(dataDir, "users.json"), STORE_FILE = path.join(dataDir, "store.json"), AUDIT_FILE = path.join(dataDir, "audit.log");
  var IND = loadIndicators(path.join(ROOT, "data", "indicators.csv"));

  /* users: reloaded when the file changes, so `passwd` takes effect without a restart */
  var users = null, usersMtime = 0;
  function readUsers() {
    var st; try { st = fs.statSync(USERS_FILE); } catch (e) { return users || {}; }
    if (!users || st.mtimeMs !== usersMtime) { usersMtime = st.mtimeMs; users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); }
    return users;
  }
  function saveUsers(u) { fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2), { mode: 0o600 }); users = null; }
  function ensureUsers() {
    if (fs.existsSync(USERS_FILE)) return;
    var seed = [["admin@unbotswana.org", "admin", "", "RCO Admin"], ["agency@unbotswana.org", "agency", "UNICEF", "UNICEF Lead"],
      ["government@gov.bw", "government", "", "Government Partner"], ["executive@unbotswana.org", "executive", "", "Executive Viewer"]];
    var u = {};
    if (!quiet) console.log("First run: creating sample accounts. Passwords are shown once. Replace them with: node server/server.js passwd EMAIL\n");
    seed.forEach(function (s) { var pw = randomPw(); u[s[0]] = makeUser(s[1], s[2], s[3], pw); if (!quiet) console.log("  " + s[0].padEnd(28) + s[1].padEnd(12) + pw); });
    if (!quiet) console.log("");
    saveUsers(u);
  }
  ensureUsers();

  /* store: updates and decisions, written atomically */
  var store = { seq: 0, updates: [], decisions: {} };
  try { store = JSON.parse(fs.readFileSync(STORE_FILE, "utf8")); } catch (e) {}
  function persist() {
    var tmp = STORE_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(store), { mode: 0o600 });
    fs.renameSync(tmp, STORE_FILE);
  }
  function audit(event, who, detail, req) {
    var line = JSON.stringify({ t: new Date().toISOString(), event: event, who: who || null, ip: req ? ipOf(req) : null, detail: detail || null });
    try { fs.appendFileSync(AUDIT_FILE, line + "\n", { mode: 0o600 }); } catch (e) {}
  }

  /* pages */
  var SRC = fs.readFileSync(pagePath, "utf8");
  function block(s, name, keep) {
    return keep ? s.replace(new RegExp("<!--@/?" + name + "-->", "g"), "") : s.replace(new RegExp("<!--@" + name + "-->[\\s\\S]*?<!--@/" + name + "-->", "g"), "");
  }
  function build(loggedIn) {
    var s = block(SRC, "demo", false);
    s = block(s, "login", !loggedIn); s = block(s, "loginjs", !loggedIn);
    s = block(s, "app", loggedIn); s = block(s, "appjs", loggedIn);
    return s.replace('<body data-auth="out">', loggedIn ? '<body data-auth="in">' : '<body data-auth="out">');
  }
  var LOGIN_PAGE = build(false), APP_PAGE = build(true);
  function withNonce(html, nonce, session) {
    var boot = '<script nonce="' + nonce + '">window.__MODE__="server";' +
      (session ? "window.__SESSION__=" + JSON.stringify(session).replace(/</g, "\\u003c") + ";" : "") + "</script>";
    return html.replace(/<script>/g, '<script nonce="' + nonce + '">').replace(/<style>/g, '<style nonce="' + nonce + '">').replace("</head>", boot + "\n</head>");
  }

  /* request facts */
  function ipOf(req) {
    if (trustProxy) { var x = String(req.headers["x-forwarded-for"] || "").split(",").pop().trim(); if (x) return x; }
    return req.socket.remoteAddress || "?";
  }
  function isHttps(req) {
    return !!req.socket.encrypted || (trustProxy && String(req.headers["x-forwarded-proto"] || "").split(",").pop().trim() === "https");
  }
  function isLoopback(req) { var a = req.socket.remoteAddress || ""; return a === "127.0.0.1" || a === "::1" || a === "::ffff:127.0.0.1"; }
  function parseCookies(h) {
    var o = {};
    String(h || "").split(";").forEach(function (p) { var i = p.indexOf("="); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); });
    return o;
  }

  /* sessions: absolute and idle limits; polling does not keep a session alive */
  var sessions = new Map();
  function sessionOf(req, touch) {
    var t = parseCookies(req.headers.cookie).rl_sid;
    var s = t && sessions.get(t);
    if (!s) return null;
    var now = Date.now(), u = readUsers()[s.email];
    if (!u || s.exp < now || now - s.seen > idleMs || s.hv !== u.hash.slice(0, 16)) { sessions.delete(t); return null; }
    if (touch) s.seen = now;
    return { token: t, email: s.email, user: u };
  }
  function publicUser(email, u) { return { email: email, name: u.name, initials: u.initials, roleKey: u.roleKey, agency: u.agency || "" }; }
  function cookie(req, value, maxAge) {
    return "rl_sid=" + value + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=" + maxAge + (secureEnv || isHttps(req) ? "; Secure" : "");
  }

  /* login throttling: per address and email, and per address overall */
  var fails = new Map();
  function failState(k) { var f = fails.get(k); if (f && Date.now() - f.first > failWindow) { fails.delete(k); f = null; } return f; }
  function waitFor(k, max) { var f = failState(k); return f && f.n >= max ? Math.ceil((failWindow - (Date.now() - f.first)) / 1000) : 0; }
  function bump(k) { var f = failState(k) || { n: 0, first: Date.now() }; f.n++; fails.set(k, f); }
  var writes = new Map();
  function writeRate(email) {
    var now = Date.now(), w = (writes.get(email) || []).filter(function (t) { return now - t < 60000; });
    if (w.length >= 120) { writes.set(email, w); return false; }
    w.push(now); writes.set(email, w); return true;
  }
  var sweep = setInterval(function () {
    var now = Date.now();
    sessions.forEach(function (v, k) { if (v.exp < now || now - v.seen > idleMs) sessions.delete(k); });
    fails.forEach(function (v, k) { if (now - v.first > failWindow) fails.delete(k); });
  }, 5 * 60 * 1000);
  sweep.unref();

  /* responses */
  var DUMMY_SALT = crypto.randomBytes(16).toString("hex");
  function baseHeaders(req, extra) {
    var h = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
      "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Resource-Policy": "same-origin", "Permissions-Policy": "geolocation=(), camera=(), microphone=()" };
    if (req && isHttps(req)) h["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    Object.keys(extra || {}).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }
  function sendJson(req, res, code, obj, extra) {
    res.writeHead(code, baseHeaders(req, Object.assign({ "Content-Type": "application/json; charset=utf-8" }, extra)));
    res.end(JSON.stringify(obj));
  }
  function sendPage(req, res, html, nonce) {
    var csp = "default-src 'none'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce + "'; style-src-attr 'unsafe-inline'; font-src 'self'; " +
      "connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
    res.writeHead(200, baseHeaders(req, { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": csp }));
    res.end(html);
  }
  function sameOrigin(req) {
    if (req.headers["sec-fetch-site"] === "cross-site") return false;
    var o = req.headers.origin;
    if (!o) return true;
    try { return new URL(o).host === req.headers.host; } catch (e) { return false; }
  }
  function readJson(req, cb) {
    var n = 0, chunks = [], dead = false;
    req.on("data", function (c) { n += c.length; if (n > 8192) { dead = true; cb(new Error("too large")); req.destroy(); return; } chunks.push(c); });
    req.on("end", function () { if (dead) return; try { cb(null, JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { cb(new Error("bad json")); } });
  }

  /* what each role may read */
  function visibleStore(role, agency) {
    var decisions = store.decisions;
    var ups = store.updates.filter(function (u) {
      var d = decisions[u.id];
      if (role === "admin") return true;
      if (d && d.status === "accepted") return true;
      return role === "agency" && u.agency === agency;
    });
    var dec = {};
    ups.forEach(function (u) { if (decisions[u.id]) dec[u.id] = decisions[u.id]; });
    return { updates: ups, decisions: dec };
  }
  function validateUpdate(b, me) {
    if (!b || typeof b !== "object") return "Send the update as JSON.";
    var role = me.user.roleKey;
    var agency = role === "agency" ? me.user.agency : clean(b.agency, 40);
    if (role === "agency" && b.agency && clean(b.agency, 40) !== me.user.agency) return { forbidden: "You can only submit for " + me.user.agency + "." };
    if (AGENCIES.indexOf(agency) < 0) return "Choose an agency from the list.";
    var ind = IND.map[b.indicator];
    if (typeof b.indicator !== "string" || !ind) return "Choose an indicator.";
    if (!Number.isInteger(b.year) || IND.years.indexOf(b.year) < 0) return "Choose a year from " + IND.years[0] + " to " + IND.years[IND.years.length - 1] + ".";
    if (typeof b.value !== "number" || !isFinite(b.value)) return "Enter the value as a number.";
    if (b.value < 0) return "The value cannot be negative.";
    if (ind.unit === "%" && b.value > 100) return "A percentage cannot be above 100.";
    if (ind.unit === "of 6" && b.value > 6) return "This indicator counts criteria out of 6.";
    var source = clean(b.source, 300);
    if (source.length < 3) return "Say where the figure comes from.";
    return { agency: agency, indicator: b.indicator, year: b.year, value: b.value, source: source, note: clean(b.note, 500) };
  }

  /* routes */
  function handle(req, res) {
    var url = String(req.url || "/").split("?")[0], isPost = req.method === "POST";

    if (requireHttps && !isHttps(req) && !isLoopback(req) && url !== "/healthz") {
      res.writeHead(308, { Location: "https://" + String(req.headers.host || "") + req.url });
      return res.end();
    }
    if (isPost && (req.headers["x-rl"] !== "1" || !sameOrigin(req) || !/^application\/json/i.test(req.headers["content-type"] || ""))) {
      return sendJson(req, res, 403, { error: "Request refused." });
    }

    if (req.method === "GET" && (url === "/" || url === "/index.html")) {
      var me = sessionOf(req, true), nonce = crypto.randomBytes(16).toString("base64");
      if (me) return sendPage(req, res, withNonce(APP_PAGE, nonce, publicUser(me.email, me.user)), nonce);
      return sendPage(req, res, withNonce(LOGIN_PAGE, nonce, null), nonce);
    }
    if (req.method === "GET" && /^\/fonts\/[a-z0-9-]+\.woff2$/.test(url)) {
      var ff = path.join(fontsDir, path.basename(url));
      return fs.readFile(ff, function (err, buf) {
        if (err) { res.writeHead(404, baseHeaders(req)); return res.end(); }
        res.writeHead(200, baseHeaders(req, { "Content-Type": "font/woff2", "Cache-Control": "public, max-age=86400" })); res.end(buf);
      });
    }
    if (req.method === "GET" && url === "/healthz") { res.writeHead(200, baseHeaders(req, { "Content-Type": "text/plain" })); return res.end("ok"); }

    if (isPost && url === "/api/login") {
      return readJson(req, function (err, b) {
        if (err || !b || typeof b.email !== "string" || typeof b.password !== "string") return sendJson(req, res, 400, { error: "Enter your email and password." });
        var email = b.email.trim().toLowerCase().slice(0, 200), pw = b.password.slice(0, 200), ip = ipOf(req);
        var kPair = ip + "|" + email, kIp = "ip|" + ip;
        var wait = Math.max(waitFor(kPair, maxFails), waitFor(kIp, ipMaxFails));
        if (wait) { audit("login_blocked", email, null, req); return sendJson(req, res, 429, { error: "Too many attempts. Try again in " + Math.ceil(wait / 60) + " minutes." }, { "Retry-After": String(wait) }); }
        var all = readUsers(), u = Object.prototype.hasOwnProperty.call(all, email) ? all[email] : null;
        var got = Buffer.from(hashPw(pw, u ? u.salt : DUMMY_SALT), "hex"), want = Buffer.from(u ? u.hash : "00".repeat(64), "hex");
        if (!u || !crypto.timingSafeEqual(got, want)) {
          bump(kPair); bump(kIp); audit("login_failed", email, null, req);
          return sendJson(req, res, 401, { error: "Email or password is not correct." });
        }
        fails.delete(kPair);
        var token = crypto.randomBytes(32).toString("hex"), now = Date.now();
        sessions.set(token, { email: email, exp: now + absMs, seen: now, hv: u.hash.slice(0, 16) });
        audit("login_ok", email, u.roleKey, req);
        return sendJson(req, res, 200, { ok: true }, { "Set-Cookie": cookie(req, token, Math.floor(absMs / 1000)) });
      });
    }
    if (isPost && url === "/api/logout") {
      var cur = sessionOf(req, false);
      if (cur) { sessions.delete(cur.token); audit("logout", cur.email, null, req); }
      return sendJson(req, res, 200, { ok: true }, { "Set-Cookie": cookie(req, "", 0) });
    }

    /* everything below needs a session */
    var who = sessionOf(req, req.headers["x-rl-poll"] !== "1");
    if (url.indexOf("/api/") === 0 && !who) return sendJson(req, res, 401, { error: "Not signed in." });
    var role = who && who.user.roleKey;

    if (req.method === "GET" && url === "/api/me") return sendJson(req, res, 200, publicUser(who.email, who.user));
    if (isPost && url === "/api/ping") return sendJson(req, res, 200, { ok: true });
    if (req.method === "GET" && url === "/api/updates") return sendJson(req, res, 200, visibleStore(role, who.user.agency));

    if (isPost && url === "/api/updates") {
      if (role !== "admin" && role !== "agency") { audit("denied", who.email, "submit as " + role, req); return sendJson(req, res, 403, { error: "Your account cannot submit updates." }); }
      return readJson(req, function (err, b) {
        if (err) return sendJson(req, res, 400, { error: "Send the update as JSON." });
        if (!writeRate(who.email)) return sendJson(req, res, 429, { error: "Too many requests. Wait a minute and try again." });
        var v = validateUpdate(b, who);
        if (typeof v === "string") return sendJson(req, res, 400, { error: v });
        if (v.forbidden) { audit("denied", who.email, v.forbidden, req); return sendJson(req, res, 403, { error: v.forbidden }); }
        if (store.updates.length >= 5000) return sendJson(req, res, 507, { error: "The update store is full. Ask the administrator to archive old updates." });
        var rec = Object.assign({ id: "u" + (++store.seq), by: who.email, ts: Date.now() }, v);
        store.updates.push(rec); persist();
        audit("update_submitted", who.email, rec.id + " " + rec.agency + " " + rec.indicator + " " + rec.year + "=" + rec.value, req);
        return sendJson(req, res, 201, { id: rec.id });
      });
    }
    if (isPost && url === "/api/decisions") {
      if (role !== "admin") { audit("denied", who.email, "decision as " + role, req); return sendJson(req, res, 403, { error: "Only the RCO administrator can accept or reject updates." }); }
      return readJson(req, function (err, b) {
        if (err || !b || typeof b.id !== "string") return sendJson(req, res, 400, { error: "Send an update id and a decision." });
        if (["accepted", "rejected", "undo"].indexOf(b.status) < 0) return sendJson(req, res, 400, { error: "Decision must be accepted, rejected or undo." });
        if (!store.updates.some(function (u) { return u.id === b.id; })) return sendJson(req, res, 404, { error: "No such update." });
        if (b.status === "undo") delete store.decisions[b.id]; else store.decisions[b.id] = { status: b.status, by: who.email, ts: Date.now() };
        persist();
        audit("decision", who.email, b.id + " " + b.status, req);
        return sendJson(req, res, 200, { ok: true });
      });
    }
    if (req.method === "GET" && url === "/api/audit") {
      if (role !== "admin") return sendJson(req, res, 403, { error: "Only the RCO administrator can read the audit log." });
      var lines = []; try { lines = fs.readFileSync(AUDIT_FILE, "utf8").split("\n").filter(Boolean).slice(-300); } catch (e) {}
      return sendJson(req, res, 200, { events: lines.map(function (l) { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean).reverse() });
    }
    res.writeHead(404, baseHeaders(req, { "Content-Type": "text/plain" }));
    res.end("Not found");
  }

  var server = http.createServer(function (req, res) {
    try { handle(req, res); } catch (e) { if (!quiet) console.error(e); if (!res.headersSent) { res.writeHead(500, { "Content-Type": "text/plain" }); } res.end("Server error"); }
  });
  server.headersTimeout = 15000; server.requestTimeout = 30000; server.keepAliveTimeout = 5000; server.maxHeadersCount = 50;
  server.on("close", function () { clearInterval(sweep); });
  server.rl = { readUsers: readUsers, dataDir: dataDir };
  return server;
}

/* ---------- command line ---------- */
function main() {
  var argv = process.argv.slice(2), cmd = argv[0];
  var dataDir = process.env.RL_DATA_DIR || path.join(ROOT, "var");
  var USERS_FILE = path.join(dataDir, "users.json");
  function load() { try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); } catch (e) { return {}; } }
  function save(u) { fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 }); fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2), { mode: 0o600 }); }
  if (cmd === "users") {
    var us = load();
    Object.keys(us).forEach(function (e) { console.log(e.padEnd(32) + us[e].roleKey.padEnd(12) + us[e].agency); });
    return;
  }
  if (cmd === "adduser" || cmd === "passwd" || cmd === "remove") {
    var email = String(argv[1] || "").trim().toLowerCase(), all = load();
    if (!/^[^\s@]+@[^\s@]+$/.test(email)) { console.error("Give a valid email address."); process.exit(1); }
    if (cmd === "remove") { if (!all[email]) { console.error("No such user."); process.exit(1); } delete all[email]; save(all); console.log("Removed " + email); return; }
    var pw = process.env.RL_PASSWORD || randomPw();
    if (pw.length < 12) { console.error("Passwords need at least 12 characters."); process.exit(1); }
    if (cmd === "passwd") {
      if (!all[email]) { console.error("No such user."); process.exit(1); }
      var salt = crypto.randomBytes(16).toString("hex"); all[email].salt = salt; all[email].hash = hashPw(pw, salt);
    } else {
      var role = argv[2];
      if (ROLES.indexOf(role) < 0) { console.error("ROLE must be one of: " + ROLES.join(", ")); process.exit(1); }
      var rest = argv.slice(3), name = email.split("@")[0], ni = rest.indexOf("--name");
      if (ni > -1) { name = clean(rest[ni + 1] || name, 80); rest.splice(ni, 2); }
      var agency = rest[0] || "";
      if (role === "agency" && AGENCIES.indexOf(agency) < 0) { console.error("The agency role needs one of: " + AGENCIES.join(", ")); process.exit(1); }
      all[email] = makeUser(role, role === "agency" ? agency : "", name, pw);
    }
    save(all);
    console.log((cmd === "passwd" ? "Password changed for " : "Saved ") + email + (process.env.RL_PASSWORD ? "" : "\nPassword: " + pw));
    return;
  }
  if (cmd) { console.error("Unknown command: " + cmd); process.exit(1); }
  var port = Number(process.env.PORT) || 3000, host = process.env.HOST || "127.0.0.1";
  if (!fs.existsSync(path.join(ROOT, "dist", "index.html"))) { console.error("dist/index.html is missing. Run: npm run build"); process.exit(1); }
  var srv = createServer();
  srv.listen(port, host, function () {
    console.log("Results Layer running at http://" + host + ":" + port + "  (data in " + srv.rl.dataDir + ")");
    var local = host === "127.0.0.1" || host === "localhost" || host === "::1";
    if (!local && process.env.RL_REQUIRE_HTTPS !== "1") console.log("Warning: this is reachable from other machines. Serve it over HTTPS and set RL_TRUST_PROXY=1 and RL_REQUIRE_HTTPS=1.");
  });
  function stop() { srv.close(function () { process.exit(0); }); setTimeout(function () { process.exit(0); }, 3000).unref(); }
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
}

module.exports = { createServer: createServer, AGENCIES: AGENCIES };
if (require.main === module) main();
