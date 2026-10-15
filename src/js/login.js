(function () {
  "use strict";
  var SERVER = window.__MODE__ === "server";
  function $(id) { return document.getElementById(id); }
  var form = $("login-form"), em = $("login-email"), pw = $("login-password"), err = $("login-error"), go = $("login-go"), rem = $("login-remember");
  var DEMO = {};
  if (!SERVER) { try { DEMO = JSON.parse($("demo-users").textContent); } catch (e) { DEMO = {}; } }
  if (SERVER) { var sn = $("server-note"); if (sn) sn.hidden = false; }
  try { var saved = localStorage.getItem("rl.email"); if (saved) { em.value = saved; rem.checked = true; } } catch (e) {}

  function say(msg) { err.textContent = msg; err.hidden = !msg; }
  function done() { go.disabled = false; go.textContent = "Sign in"; }
  function userOf(email) {
    var u = DEMO[email];
    return { email: email, name: u.name, initials: u.initials, roleKey: u.roleKey, agency: u.agency || "" };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault(); say("");
    var email = em.value.trim().toLowerCase(), pass = pw.value;
    if (!email || !pass) { say("Enter your email and password."); return; }
    try { if (rem.checked) localStorage.setItem("rl.email", email); else localStorage.removeItem("rl.email"); } catch (x) {}
    if (SERVER) {
      go.disabled = true; go.textContent = "Signing in";
      fetch("/api/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-RL": "1" }, body: JSON.stringify({ email: email, password: pass, remember: rem.checked }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) { if (x.ok) { location.replace("/"); } else { say(x.j.error || "Sign-in failed. Try again."); pw.value = ""; pw.focus(); done(); } })
        .catch(function () { say("Cannot reach the server. Check your connection and try again."); done(); });
      return;
    }
    if (DEMO[email] && DEMO[email].password === pass) { pw.value = ""; window.RL.enter(userOf(email)); }
    else say("Email or password is not correct. Use one of the demo accounts below.");
  });

  document.querySelectorAll("[data-demo]").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-demo"), hit = null;
      Object.keys(DEMO).forEach(function (k) { if (DEMO[k].roleKey === key) hit = k; });
      if (hit) { say(""); pw.value = ""; window.RL.enter(userOf(hit)); }
    });
  });
  $("pw-toggle").addEventListener("click", function () {
    var show = pw.type === "password";
    pw.type = show ? "text" : "password";
    this.textContent = show ? "Hide" : "Show";
    this.setAttribute("aria-pressed", show ? "true" : "false");
    this.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  $("forgot-password").addEventListener("click", function () {
    say(SERVER ? "Ask your administrator to reset your password." : "Password reset is not part of this demo. Use a demo account below.");
  });
  if (!window.matchMedia || !window.matchMedia("(max-width: 899px)").matches) { try { em.focus(); } catch (e) {} }
})();
