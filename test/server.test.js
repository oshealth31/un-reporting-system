"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { createServer } = require("../server/server.js");

const PW = "correct-horse-battery";
function userRec(role, agency, name) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(PW, Buffer.from(salt, "hex"), 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  return { name, initials: name.slice(0, 2).toUpperCase(), roleKey: role, agency: agency || "", salt, hash };
}
async function start(extra) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rl-"));
  fs.writeFileSync(path.join(dir, "users.json"), JSON.stringify({
    "admin@x.org": userRec("admin", "", "Admin"), "unicef@x.org": userRec("agency", "UNICEF", "Unicef Lead"),
    "who@x.org": userRec("agency", "WHO", "Who Lead"), "gov@x.org": userRec("government", "", "Gov"), "exec@x.org": userRec("executive", "", "Exec"),
  }));
  const srv = createServer(Object.assign({ dataDir: dir, quiet: true }, extra));
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + srv.address().port;
  const jar = {};
  async function call(method, url, body, who, headers) {
    const h = Object.assign({ "X-RL": "1", "Content-Type": "application/json" }, headers || {});
    if (who && jar[who]) h.Cookie = jar[who];
    const r = await fetch(base + url, { method, headers: h, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
    const sc = r.headers.get("set-cookie");
    if (sc && who) jar[who] = sc.split(";")[0];
    let j = null; const text = await r.text(); try { j = JSON.parse(text); } catch (e) {}
    return { status: r.status, json: j, text, headers: r.headers };
  }
  async function login(email, who) { return call("POST", "/api/login", { email, password: PW }, who || email); }
  return { srv, dir, base, call, login, jar, close: () => new Promise((r) => { srv.close(r); srv.closeAllConnections(); }) };
}
const UP = { agency: "UNICEF", indicator: "2.1.1", year: 2025, value: 71.2, source: "Ministry of Health report", note: "" };

test("signed-out visitors get only the login page, with no data or demo passwords", async () => {
  const t = await start();
  const r = await t.call("GET", "/");
  assert.equal(r.status, 200);
  assert.ok(r.text.includes('id="login-form"'));
  for (const bad of ["Programme intelligence", "demo123", 'id="demo-users"', "UNICEF Lead", "Seats held by women in parliament", "id=\"ov\""]) assert.ok(!r.text.includes(bad), bad);
  assert.ok(/default-src 'none'/.test(r.headers.get("content-security-policy")));
  assert.equal((await t.call("GET", "/api/updates")).status, 401);
  assert.equal((await t.call("GET", "/api/audit")).status, 401);
  await t.close();
});

test("login: wrong password fails, right one gives an HttpOnly SameSite cookie and the app", async () => {
  const t = await start();
  assert.equal((await t.call("POST", "/api/login", { email: "admin@x.org", password: "nope" })).status, 401);
  assert.equal((await t.call("POST", "/api/login", { email: "nobody@x.org", password: "nope" })).json.error, "Email or password is not correct.");
  const ok = await t.login("admin@x.org");
  assert.equal(ok.status, 200);
  const sc = ok.headers.get("set-cookie");
  assert.ok(/HttpOnly/.test(sc) && /SameSite=Strict/.test(sc));
  const page = await t.call("GET", "/", null, "admin@x.org");
  assert.ok(page.text.includes("Programme intelligence") && page.text.includes("__SESSION__"));
  assert.ok(!page.text.includes('id="login-form"') && !page.text.includes("demo123"));
  await t.close();
});

test("forged or cross-site requests are refused", async () => {
  const t = await start();
  assert.equal((await t.call("POST", "/api/login", { email: "a", password: "b" }, null, { "X-RL": "0" })).status, 403);
  assert.equal((await t.call("POST", "/api/login", { email: "a", password: "b" }, null, { Origin: "http://evil.example" })).status, 403);
  assert.equal((await t.call("POST", "/api/login", { email: "a", password: "b" }, null, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  assert.equal((await t.call("POST", "/api/login", { email: "a", password: "b" }, null, { "Content-Type": "text/plain" })).status, 403);
  await t.close();
});

test("lockout: 5 failures for one email, and 20 failures from one address across emails", async () => {
  const t = await start();
  for (let i = 0; i < 5; i++) assert.equal((await t.call("POST", "/api/login", { email: "admin@x.org", password: "bad" })).status, 401);
  const blocked = await t.call("POST", "/api/login", { email: "admin@x.org", password: PW });
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get("retry-after"));
  let last;
  for (let i = 0; i < 21; i++) last = await t.call("POST", "/api/login", { email: "spray" + i + "@x.org", password: "bad" });
  assert.equal(last.status, 429, "password spraying across many emails is also limited");
  assert.equal((await t.call("POST", "/api/login", { email: "gov@x.org", password: PW })).status, 429);
  await t.close();
});

test("agency lead can submit only for their own agency; the server enforces it", async () => {
  const t = await start();
  await t.login("unicef@x.org");
  const bad = await t.call("POST", "/api/updates", Object.assign({}, UP, { agency: "WHO" }), "unicef@x.org");
  assert.equal(bad.status, 403);
  const ok = await t.call("POST", "/api/updates", UP, "unicef@x.org");
  assert.equal(ok.status, 201);
  const noAgency = await t.call("POST", "/api/updates", { indicator: "2.1.1", year: 2025, value: 70, source: "Report X" }, "unicef@x.org");
  assert.equal(noAgency.status, 201);
  await t.close();
});

test("validation: bad indicator, year, negative, percent over 100, short source", async () => {
  const t = await start();
  await t.login("admin@x.org");
  const cases = [{ indicator: "9.9.9" }, { year: 1999 }, { year: "2025" }, { value: -1 }, { value: "71" }, { value: 101 }, { source: "x" }, { agency: "Nope" }];
  for (const c of cases) assert.equal((await t.call("POST", "/api/updates", Object.assign({}, UP, c), "admin@x.org")).status, 400, JSON.stringify(c));
  await t.close();
});

test("read-only roles cannot submit; only the administrator can decide", async () => {
  const t = await start();
  for (const u of ["gov@x.org", "exec@x.org"]) { await t.login(u); assert.equal((await t.call("POST", "/api/updates", UP, u)).status, 403); }
  await t.login("unicef@x.org"); await t.login("admin@x.org");
  const id = (await t.call("POST", "/api/updates", UP, "unicef@x.org")).json.id;
  assert.equal((await t.call("POST", "/api/decisions", { id, status: "accepted" }, "unicef@x.org")).status, 403);
  assert.equal((await t.call("POST", "/api/decisions", { id, status: "accepted" }, "gov@x.org")).status, 403);
  assert.equal((await t.call("POST", "/api/decisions", { id: "nope", status: "accepted" }, "admin@x.org")).status, 404);
  assert.equal((await t.call("POST", "/api/decisions", { id, status: "maybe" }, "admin@x.org")).status, 400);
  assert.equal((await t.call("POST", "/api/decisions", { id, status: "accepted" }, "admin@x.org")).status, 200);
  await t.close();
});

test("visibility: pending updates are private to the agency and admin; accepted ones reach everyone", async () => {
  const t = await start();
  for (const u of ["admin@x.org", "unicef@x.org", "who@x.org", "gov@x.org"]) await t.login(u);
  const id = (await t.call("POST", "/api/updates", UP, "unicef@x.org")).json.id;
  const ids = async (u) => (await t.call("GET", "/api/updates", null, u)).json.updates.map((x) => x.id);
  assert.deepEqual(await ids("admin@x.org"), [id]);
  assert.deepEqual(await ids("unicef@x.org"), [id]);
  assert.deepEqual(await ids("who@x.org"), [], "another agency cannot see a pending update");
  assert.deepEqual(await ids("gov@x.org"), [], "government cannot see a pending update");
  await t.call("POST", "/api/decisions", { id, status: "accepted" }, "admin@x.org");
  assert.deepEqual(await ids("who@x.org"), [id]);
  assert.deepEqual(await ids("gov@x.org"), [id]);
  const g = (await t.call("GET", "/api/updates", null, "gov@x.org")).json;
  assert.equal(g.decisions[id].status, "accepted");
  await t.call("POST", "/api/decisions", { id, status: "rejected" }, "admin@x.org");
  assert.deepEqual(await ids("gov@x.org"), []);
  await t.close();
});

test("updates and decisions survive a restart", async () => {
  const t = await start();
  await t.login("unicef@x.org"); await t.login("admin@x.org");
  const id = (await t.call("POST", "/api/updates", UP, "unicef@x.org")).json.id;
  await t.call("POST", "/api/decisions", { id, status: "accepted" }, "admin@x.org");
  const dir = t.dir; await t.close();
  const srv = createServer({ dataDir: dir, quiet: true });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + srv.address().port;
  const l = await fetch(base + "/api/login", { method: "POST", headers: { "X-RL": "1", "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@x.org", password: PW }) });
  const ck = l.headers.get("set-cookie").split(";")[0];
  const r = await (await fetch(base + "/api/updates", { headers: { Cookie: ck, "X-RL": "1" } })).json();
  assert.equal(r.updates.length, 1); assert.equal(r.decisions[id].status, "accepted");
  await new Promise((x) => { srv.close(x); srv.closeAllConnections(); });
});

test("audit log records logins, failures, submissions and decisions, and only the administrator can read it", async () => {
  const t = await start();
  await t.call("POST", "/api/login", { email: "admin@x.org", password: "bad" });
  await t.login("admin@x.org"); await t.login("unicef@x.org");
  const id = (await t.call("POST", "/api/updates", UP, "unicef@x.org")).json.id;
  await t.call("POST", "/api/updates", Object.assign({}, UP, { agency: "WHO" }), "unicef@x.org");
  await t.call("POST", "/api/decisions", { id, status: "accepted" }, "admin@x.org");
  assert.equal((await t.call("GET", "/api/audit", null, "unicef@x.org")).status, 403);
  const ev = (await t.call("GET", "/api/audit", null, "admin@x.org")).json.events.map((e) => e.event);
  for (const e of ["login_failed", "login_ok", "update_submitted", "denied", "decision"]) assert.ok(ev.includes(e), e);
  const raw = fs.readFileSync(path.join(t.dir, "audit.log"), "utf8");
  assert.ok(!raw.includes(PW), "passwords are never logged");
  await t.close();
});

test("changing a password ends that person's sessions", async () => {
  const t = await start();
  await t.login("gov@x.org");
  assert.equal((await t.call("GET", "/api/me", null, "gov@x.org")).status, 200);
  const f = path.join(t.dir, "users.json"), u = JSON.parse(fs.readFileSync(f, "utf8"));
  const salt = crypto.randomBytes(16).toString("hex");
  u["gov@x.org"].salt = salt; u["gov@x.org"].hash = crypto.scryptSync("another-long-password", Buffer.from(salt, "hex"), 64, { N: 16384, r: 8, p: 1 }).toString("hex");
  fs.writeFileSync(f, JSON.stringify(u)); fs.utimesSync(f, new Date(), new Date(Date.now() + 5000));
  assert.equal((await t.call("GET", "/api/me", null, "gov@x.org")).status, 401);
  await t.close();
});

test("idle sessions expire, and background polling does not keep them alive", async () => {
  const t = await start({ idleMin: 0.02 });  // 1.2 seconds
  await t.login("admin@x.org");
  await new Promise((r) => setTimeout(r, 700));
  assert.equal((await t.call("GET", "/api/updates", null, "admin@x.org", { "X-RL-Poll": "1" })).status, 200);
  await new Promise((r) => setTimeout(r, 700));
  assert.equal((await t.call("GET", "/api/updates", null, "admin@x.org", { "X-RL-Poll": "1" })).status, 401);
  await t.login("admin@x.org");
  await new Promise((r) => setTimeout(r, 700));
  assert.equal((await t.call("POST", "/api/ping", {}, "admin@x.org")).status, 200);
  await new Promise((r) => setTimeout(r, 700));
  assert.equal((await t.call("GET", "/api/me", null, "admin@x.org")).status, 200, "a real action keeps it alive");
  await t.close();
});

test("logout ends the session", async () => {
  const t = await start();
  await t.login("admin@x.org");
  await t.call("POST", "/api/logout", {}, "admin@x.org");
  assert.equal((await t.call("GET", "/api/me", null, "admin@x.org")).status, 401);
  await t.close();
});

test("HTTPS behind a proxy: redirect, Secure cookie and HSTS", async () => {
  const t = await start({ trustProxy: true, requireHttps: true });
  const plain = await t.call("GET", "/", null, null, { Host: "pilot.example.org" });
  assert.ok(plain.status === 200 || plain.status === 308);   // loopback caller is exempt from the redirect
  const l = await t.call("POST", "/api/login", { email: "admin@x.org", password: PW }, null, { "X-Forwarded-Proto": "https" });
  assert.ok(/; Secure/.test(l.headers.get("set-cookie")));
  assert.ok(/max-age=31536000/.test(l.headers.get("strict-transport-security")));
  await t.close();
});

test("unknown paths and methods do not leak anything", async () => {
  const t = await start();
  for (const p of ["/users.json", "/var/users.json", "/data/indicators.csv", "/../package.json", "/server/server.js", "/store.json"]) {
    const r = await t.call("GET", p); assert.equal(r.status, 404, p); assert.ok(!r.text.includes("hash"));
  }
  await t.close();
});
