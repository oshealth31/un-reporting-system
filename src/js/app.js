(function () {
  "use strict";
  var YEARS = [2022, 2023, 2024, 2025], CUR = 2024;
  var AGENCIES = ["UNDP", "UNICEF", "WHO", "UNFPA", "UNAIDS", "FAO", "UN Women", "ILO", "IOM", "UNHCR", "UNESCO", "UNODC", "UNEP", "UNIDO", "IFAD", "OHCHR", "RCO"];
  var AS_OF = Date.UTC(2026, 9, 13), YEAR_END = Date.UTC(2026, 11, 31);
  var DAYS_LEFT = Math.round((YEAR_END - AS_OF) / 86400000);
  var OUT = [
    { n: 1, name: "Gender equality" }, { n: 2, name: "Access to services" },
    { n: 3, name: "Food, land and climate" }, { n: 4, name: "Prosperity and jobs" },
    { n: 5, name: "Justice, data and partnerships" }
  ];
  var ST = {
    tracked: "Tracked", notarget: "No target", stale: "Out of date", nodata: "No data"
  };
  var STHELP = {
    tracked: "Has a target and a value for " + CUR,
    notarget: "Has data but no target, so progress cannot be judged",
    stale: "Has a target but the latest value is older than " + CUR,
    nodata: "No value reported in any year"
  };

  var SRC_EVAL = "UNSDCF evaluation, Feb 2026", SRC_RES = "UN results report 2024", SRC_UNDP = "UNDP country evaluation, Jan 2026";
  // id, outcome, name, unit, baseline, target, [2022, 2023, 2024, 2025], lead, source, note
  var BASE_INDS = [
    ["1.0.1", 1, "Seats held by women in parliament", "%", 9, null, [9, null, 8, null], "UNDP, UN Women", SRC_EVAL, "Fell from 9% to 8% after the October 2024 election. The same report also gives 8.7% (6 of 69 seats)."],
    ["1.1.1", 1, "Gender statistics products supporting SDG 5 monitoring", "count", null, null, [null, null, null, null], "Not assigned", SRC_EVAL, "No target set and no activity reported."],
    ["1.1.2", 1, "Public institutions skilled in gender-responsive budgeting", "count", null, null, [1, null, null, null], "UNDP", SRC_EVAL, "Only the National Gender Commission was supported (2022). No follow-up support to put its framework into use."],
    ["1.2.1", 1, "Women-led businesses with improved performance or income", "count", 0, 150, [null, 13, 326, null], "FAO, UN Women, UNDP", SRC_EVAL, "Annual targets were 50, 100 and 150. The 2024 result is 217% of target. Baseline taken as zero."],
    ["1.3.1", 1, "Capacity-building initiatives on GBV for police, justice, health, chiefs and schools", "count", null, null, [15, 3, null, null], "UN system", SRC_EVAL, "No targets set. No result reported for 2024."],
    ["1.3.2", 1, "Institutions and CSOs able to coordinate a GBV and child-violence response", "count", null, null, [16, null, null, null], "UN system", SRC_EVAL, "No target. No result in 2023 or 2024."],
    ["1.3.3", 1, "Laws and regulations on violence and reproductive health developed", "count", null, null, [null, null, 2, null], "UNICEF, UNFPA", SRC_EVAL, "Child Protection Committees' Guide and the Comprehensive Post Abortion Care guidelines (2024)."],
    ["2.1.1", 2, "Children aged 12 to 23 months fully immunised (DTP3)", "%", 70, 95, [63.5, 69, null, null], "UNICEF", SRC_EVAL, "Baseline 70% (2021). The 95% target is for 2026 and the evaluation judged it unlikely to be met. No 2024 result."],
    ["2.1.2", 2, "People diagnosed with HIV who are on treatment", "%", 89, null, [93.2, null, null, null], "UNAIDS", SRC_EVAL, "No target. The next figure comes from the Botswana AIDS Impact Survey, held every five years."],
    ["2.1.3", 2, "Breast and cervical cancers diagnosed early", "%", null, null, [null, null, null, null], "WHO", SRC_EVAL, "No target and no result in any year."],
    ["2.1.4", 2, "National health policies adopted with UN support", "count", null, null, [null, 2, 4, null], "UN system", SRC_EVAL, "2024 includes the costed immunisation strategy 2024-2029 and the laboratory, oral health and prison health policies."],
    ["2.2.1", 2, "International Health Regulations core capacities index", "index", 13, null, [15, 15, 15, null], "WHO", SRC_EVAL, "No target. The index has stayed at 15. The public health emergency operations centre still has no site."],
    ["2.3.1", 2, "Schools implementing the inclusive education policy", "%", null, null, [null, null, null, null], "UNICEF", SRC_EVAL, "No target and no result in any year."],
    ["2.3.2", 2, "People gaining skills and lifelong learning, including sexuality education", "count", 0, 195926, [null, 526497, 566282, null], "UN system", SRC_EVAL, "Annual target was about 195,000 (194,459 in 2023). Results are 271% and 289% of target. Baseline taken as zero."],
    ["2.4.1", 2, "New or revised social protection policies with UN support", "count", null, null, [null, null, null, null], "UNICEF", SRC_EVAL, "No target and no result. UN support was limited to one gender assessment."],
    ["2.4.2", 2, "People accessing basic services with UN support", "count", null, null, [null, null, null, null], "UN system", SRC_EVAL, "No target and no result in any year."],
    ["3.0.1", 3, "Households with moderate or severe food insecurity (national)", "%", 50.8, null, [53.3, 49.4, null, null], "FAO", SRC_EVAL, "Survey rounds: 2018/19 50.8%, 2020/21 51.1%, 2021/22 53.3%, 2022/23 49.4%. Shown against 2022 and 2023."],
    ["3.0.2", 3, "People benefiting from nature protection initiatives", "count", null, null, [null, 73, 22, null], "UNDP, FAO", SRC_RES, "Fell from 73 to 22. Wildlife scouts were hired around Habu."],
    ["3.0.3", 3, "People gaining access to clean energy", "count", null, null, [null, null, 50, null], "UNDP", SRC_RES, "Solar training for 50 rural women in Mahalapye."],
    ["3.0.4", 3, "Biogas digesters built and working", "count", 230, null, [230, null, 317, null], "UNDP", SRC_UNDP, "230 in Phase I and 87 in Phase II by December 2024. Government has funded the national rollout since 2024."],
    ["4.0.1", 4, "Private-sector entities with improved performance or income", "count", null, null, [null, 2, 215, null], "UNDP", SRC_RES, "From 2 to 215. The report notes 65 women and girls and 150 young people among them."],
    ["4.0.2", 4, "People with better access to infrastructure services", "count", null, null, [null, 175, 119, null], "UN system", SRC_RES, "Fell from 175 to 119."],
    ["4.0.3", 4, "Women-owned small firms in the AfCFTA guided trade initiative", "count", null, null, [null, null, 10, null], "UNDP", SRC_RES, "Includes informal businesses."],
    ["5.0.1", 5, "SDG indicators with national data", "%", null, null, [34.8, null, null, null], "UN system", SRC_EVAL, "From the 2022 common country analysis: 34.8% of 209 indicators had data. 88 had baselines and 42 had targets."],
    ["5.0.2", 5, "People reached by anti-trafficking and forced-labour programmes", "count", null, null, [null, null, 1100, null], "IOM", SRC_RES, "Border communities, sex workers, truck drivers and students in 7 districts."],
    ["5.0.3", 5, "Birth registration criteria met (of 6 international criteria)", "of 6", null, 6, [null, null, 6, null], "UN system", SRC_RES, "The service meets all six criteria in 2024."],
    ["5.0.4", 5, "Corruption Perceptions Index score", "score", null, null, [null, 59, 57, null], "UNDP", SRC_UNDP, "Slipped from 59 to 57 in 2024, short of the programme's target."]
  ];
  // agency, outcome, required, available, spent (USD thousands)
  var FUND = [
    ["UNDP", 3, 2400, 1900, 1500], ["UNDP", 4, 1200, 900, 850], ["UNDP", 5, 500, 380, 300], ["UNDP", 1, 200, 150, 120],
    ["UNICEF", 2, 1100, 950, 640], ["UNICEF", 1, 300, 240, 150], ["UNICEF", 5, 180, 160, 140],
    ["WHO", 2, 620, 620, 420], ["UNFPA", 2, 280, 275, 200], ["UNFPA", 1, 180, 120, 70],
    ["UNAIDS", 2, 1220, 1117, 862], ["FAO", 3, 1040, 1040, 720], ["FAO", 1, 80, 70, 60],
    ["UN Women", 1, 580, 394, 362], ["ILO", 4, 170, 90, 80], ["ILO", 1, 60, 50, 40],
    ["IOM", 5, 115, 97, 72], ["IOM", 1, 40, 30, 20], ["UNHCR", 2, 160, 110, 110],
    ["UNESCO", 2, 80, 80, 62], ["UNODC", 5, 65, 65, 38], ["UNEP", 3, 570, 640, 450]
  ];
  var DISTRICTS = ["Gaborone", "Kweneng", "Southern", "Central", "North-East", "Ngamiland", "Chobe", "Ghanzi", "Kgalagadi"];
  // title, outcome, lead, partners, districts, status, budget K
  var ACTS = [
    ["School GBV prevention programme", 1, "UNICEF", ["UNESCO", "UNFPA"], ["Gaborone", "Kweneng", "Central"], "on", 150],
    ["Women entrepreneurs export readiness", 1, "UN Women", ["UNDP", "FAO"], ["Gaborone", "Southern"], "on", 220],
    ["Child protection committee guide rollout", 1, "UNICEF", [], ["Ngamiland", "Kweneng"], "on", 90],
    ["Immunisation outreach in low-coverage areas", 2, "UNICEF", ["WHO"], ["Kweneng", "Ghanzi", "Kgalagadi"], "late", 310],
    ["HIV sustainability roadmap", 2, "UNAIDS", ["WHO", "UNFPA"], ["National"], "on", 280],
    ["Health commodity stockout response", 2, "WHO", ["UNICEF", "UNFPA"], ["National"], "late", 320],
    ["Drone delivery of reproductive health supplies", 2, "UNFPA", [], ["Ngamiland", "Ghanzi"], "on", 140],
    ["Inclusive education pilot schools", 2, "UNICEF", ["UNESCO"], ["Ghanzi", "Kgalagadi"], "late", 175],
    ["Public health emergency operations centre", 2, "WHO", [], ["Gaborone"], "not", 260],
    ["Land restoration strategy and GIS lab", 3, "FAO", ["UNEP", "UNDP"], ["Chobe", "Central"], "on", 410],
    ["National biogas rollout", 3, "UNDP", [], ["Central", "North-East", "Southern"], "on", 580],
    ["Drought support and cluster garden farms", 3, "UNDP", ["FAO"], ["Ngamiland"], "late", 360],
    ["Drought early-warning data hub", 3, "FAO", ["UNDP"], ["National"], "not", 190],
    ["Post-harvest handling training", 3, "FAO", [], ["Central", "Southern"], "on", 120],
    ["Guided trade for small exporters", 4, "UNDP", ["ILO"], ["Gaborone"], "on", 240],
    ["Informal sector strategy", 4, "ILO", ["UNDP"], ["National"], "late", 110],
    ["Youth skills and entrepreneurship", 4, "UNICEF", ["UNDP", "ILO"], ["Gaborone", "North-East"], "on", 200],
    ["Anti-trafficking awareness campaign", 5, "IOM", ["UNODC"], ["North-East", "Ghanzi", "Ngamiland"], "on", 115],
    ["Census data analysis and release", 5, "UNFPA", ["UNDP"], ["National"], "on", 130],
    ["National Development Plan 12 support", 5, "UNDP", ["UNICEF", "UNFPA"], ["National"], "on", 200],
    ["Prosecutor training on illicit flows", 5, "UNODC", [], ["Gaborone"], "late", 65],
    ["Civil registration strategy", 5, "UNFPA", [], ["National"], "not", 80]
  ];
  var STAGES = ["Request", "Ministry review", "Finance approval", "Procurement", "Delivered"];
  // item, agency, ministry, outcome, stage, days in stage, value K
  var DELIV = [
    ["Immunisation antigens top-up", "UNICEF", "Health", 2, 2, 41, 210],
    ["Biodigester masonry kits", "UNDP", "Minerals and Energy", 3, 3, 22, 95],
    ["Cluster garden equipment", "UNDP", "Agriculture", 3, 1, 57, 180],
    ["Emergency health supplies", "WHO", "Health", 2, 3, 9, 320],
    ["Inclusive education learning materials", "UNICEF", "Education", 2, 2, 36, 85],
    ["School digital literacy training", "UNICEF", "Education", 2, 4, 0, 70],
    ["Reproductive health drone flights", "UNFPA", "Health", 2, 1, 14, 60],
    ["GIS lab software licences", "FAO", "Environment and Tourism", 3, 2, 48, 40],
    ["Prosecutor training venue and travel", "UNODC", "Justice", 5, 1, 63, 38],
    ["Census paper printing", "UNFPA", "Statistics Botswana", 5, 3, 12, 25]
  ];

  var INDS = clone(BASE_INDS);
  var state = { thr: 75, days: 30 };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function sum(a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); }
  function fmtK(k) { return Math.abs(k) >= 1000 ? "$" + (k / 1000).toFixed(1).replace(/\.0$/, "") + "M" : "$" + Math.round(k) + "K"; }
  function fmtV(v, u) {
    if (v == null) return "—";
    if (u === "%") return (Math.round(v * 10) / 10) + "%";
    if (u === "USD") return v >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + v.toLocaleString("en");
    return v.toLocaleString("en");
  }
  function oc(n) { return "var(--o" + n + ")"; }
  function oname(n) { return n ? OUT[n - 1].name : "All outcomes"; }

  function latest(r) {
    for (var i = YEARS.length - 1; i >= 0; i--) if (r[6][i] != null) return { year: YEARS[i], v: r[6][i] };
    return null;
  }
  function status(r) {
    var L = latest(r);
    if (!L) return "nodata";
    if (r[5] == null) return "notarget";
    if (L.year < CUR) return "stale";
    return "tracked";
  }
  function progress(r) {
    var L = latest(r);
    if (!L || r[5] == null || r[4] == null || r[5] === r[4]) return null;
    return Math.max(0, (L.v - r[4]) / (r[5] - r[4]));
  }
  function inOut(o, n) { return !o || o === n; }
  function fundRows(o) { return FUND.filter(function (f) { return inOut(o, f[1]); }); }
  function agencyTotals(o, thr) {
    var m = {};
    fundRows(o).forEach(function (f) {
      var a = m[f[0]] || (m[f[0]] = { name: f[0], req: 0, av: 0, sp: 0 });
      a.req += f[2]; a.av += f[3]; a.sp += f[4];
    });
    return Object.keys(m).map(function (k) {
      var a = m[k]; a.rate = a.av ? a.sp / a.av * 100 : 0; a.unspent = a.av - a.sp; a.low = a.rate < thr; return a;
    });
  }
  function isJoint(a) { return a[3].length > 0; }
  function stuckItems(o) {
    return DELIV.filter(function (d) { return d[4] < 4 && d[5] > state.days && inOut(o, d[3]); })
      .sort(function (a, b) { return b[5] - a[5]; });
  }

  /* tooltips */
  var tip = $("tip");
  function placeTip(x, y) {
    tip.style.left = Math.max(8, Math.min(x + 12, window.innerWidth - tip.offsetWidth - 8)) + "px";
    tip.style.top = Math.max(8, Math.min(y + 14, window.innerHeight - tip.offsetHeight - 8)) + "px";
  }
  document.addEventListener("pointerover", function (e) {
    var t = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t.getAttribute("data-tip"); tip.hidden = false; placeTip(e.clientX, e.clientY);
  });
  document.addEventListener("pointermove", function (e) { if (!tip.hidden) placeTip(e.clientX, e.clientY); });
  document.addEventListener("focusin", function (e) {
    var t = e.target.closest ? e.target.closest("[data-tip]") : null;
    if (!t) { tip.hidden = true; return; }
    var r = t.getBoundingClientRect(); tip.textContent = t.getAttribute("data-tip"); tip.hidden = false; placeTip(r.left, r.bottom);
  });
  document.addEventListener("focusout", function () { tip.hidden = true; });

  /* ---------- Overview ---------- */
  function renderOverview() {
    var counts = { tracked: 0, notarget: 0, stale: 0, nodata: 0 };
    INDS.forEach(function (r) { counts[status(r)]++; });
    var tot = sum(FUND, function (f) { return f[3]; }), sp = sum(FUND, function (f) { return f[4]; });
    var ags = agencyTotals(0, state.thr), low = ags.filter(function (a) { return a.low; });
    var lowUnspent = sum(low, function (a) { return a.unspent; });
    var joint = ACTS.filter(isJoint).length;
    var stuck = stuckItems(0);
    var stuckVal = sum(stuck, function (d) { return d[6]; });

    var kpis = [
      ["Indicators with a target and current data", counts.tracked + " of " + INDS.length, Math.round(counts.tracked / INDS.length * 100) + "% can be judged for progress"],
      ["Spent of available funds", Math.round(sp / tot * 100) + "%", fmtK(sp) + " of " + fmtK(tot), 1],
      ["Unspent in agencies below the " + state.thr + "% review line", fmtK(lowUnspent), low.length + " of " + ags.length + " agencies, " + DAYS_LEFT + " days to year-end", 1],
      ["Activities delivered jointly", Math.round(joint / ACTS.length * 100) + "%", joint + " of " + ACTS.length + " activities", 1],
      ["Approvals waiting over " + state.days + " days", String(stuck.length), fmtK(stuckVal) + " held up", 1]
    ];
    var kh = '<div class="kpis">' + kpis.map(function (k) {
      return '<div class="kpi"><div class="l">' + esc(k[0]) + '</div><div class="v">' + esc(k[1]) + '</div><div class="s">' + esc(k[2]) + (k[3] ? ' <span class="chip">Sample</span>' : "") + "</div></div>";
    }).join("") + "</div>";

    var legend = '<div class="legend">' + ["tracked", "notarget", "stale", "nodata"].map(function (s) {
      return '<span><i class="sw-' + s + '"></i>' + ST[s] + "</span>";
    }).join("") + "</div>";
    var rows = OUT.map(function (o) {
      var rs = INDS.filter(function (r) { return r[1] === o.n; });
      var c = { tracked: 0, notarget: 0, stale: 0, nodata: 0 };
      rs.forEach(function (r) { c[status(r)]++; });
      var segs = ["tracked", "notarget", "stale", "nodata"].filter(function (s) { return c[s]; }).map(function (s) {
        return '<span class="seg s-' + s + '" tabindex="0" style="flex:' + c[s] + '" data-tip="' + esc(c[s] + " " + ST[s].toLowerCase() + ": " + STHELP[s]) + '"></span>';
      }).join("");
      return '<div class="crow" style="--c:' + oc(o.n) + '"><div class="cl"><span class="dot"></span><span>' + esc(o.name) + '</span></div><div class="cbar">' + segs + '</div><div class="cn">' + c.tracked + " of " + rs.length + " tracked</div></div>";
    }).join("");
    var complete = '<div class="block"><h2>Can we tell if each outcome is on course?</h2><p class="sub">Each bar is one outcome, split by whether its indicators have a target and a current value. Grey and dashed segments are the gaps.</p>' + legend + rows + "</div>";

    var maxReq = Math.max.apply(null, OUT.map(function (o) { return sum(fundRows(o.n), function (f) { return f[2]; }); }));
    var frows = OUT.map(function (o) {
      var fr = fundRows(o.n), R = sum(fr, function (f) { return f[2]; }), A = sum(fr, function (f) { return f[3]; }), S = sum(fr, function (f) { return f[4]; });
      var w = function (v) { return (v / maxReq * 100).toFixed(1) + "%"; };
      return '<div class="frow" style="--c:' + oc(o.n) + '"><div class="cl"><span class="dot"></span><span>' + esc(o.name) + '</span></div>' +
        '<div class="ftrack" tabindex="0" style="width:' + w(R) + '" data-tip="' + esc(o.name + ": required " + fmtK(R) + ", available " + fmtK(A) + ", spent " + fmtK(S)) + '"><span class="av" style="width:' + (A / R * 100).toFixed(1) + '%"></span><span class="sp" style="width:' + (S / R * 100).toFixed(1) + '%"></span></div>' +
        '<div class="fn">spent ' + fmtK(S) + " of " + fmtK(A) + " available · needs " + fmtK(R) + " · gap " + Math.round((1 - A / R) * 100) + "%</div></div>";
    }).join("");
    var funding = '<div class="block"><h2>Funding against need <span class="chip">Sample</span></h2><p class="sub">Outlined bar is the amount required. Pale fill is what is available. Solid fill is what has been spent.</p>' + frows + "</div>";

    var att = [];
    stuck.slice(0, 3).forEach(function (d) {
      att.push(["▲", d[0] + " (" + d[1] + ")", d[5] + " days at " + STAGES[d[4]].toLowerCase() + " with " + d[2] + " · " + fmtK(d[6])]);
    });
    low.sort(function (a, b) { return b.unspent - a.unspent; }).slice(0, 2).forEach(function (a) {
      att.push(["▲", a.name + " has spent " + Math.round(a.rate) + "% of its funds", fmtK(a.unspent) + " unspent with " + DAYS_LEFT + " days left in the year"]);
    });
    var late = ACTS.filter(function (a) { return a[5] === "late"; }).length, notst = ACTS.filter(function (a) { return a[5] === "not"; }).length;
    att.push(["▲", late + " activities are delayed and " + notst + " have not started", allowed("money") ? "See Funding and work plan for where they sit by outcome and district" : "Raise them with the Resident Coordinator's Office"]);
    var gaps = INDS.filter(function (r) { var s = status(r); return s === "nodata" || s === "notarget"; });
    if (gaps.length) att.push(["▲", gaps.length + " indicators cannot be assessed", gaps.slice(0, 3).map(function (r) { return r[0] + " " + r[2]; }).join("; ") + (gaps.length > 3 ? "; and more" : "")]);
    var pend = pendingCount();
    if (pend && allowed("submit")) {
      var mine = !canReviewNow() && AUTH.user.agency;
      att.unshift(["\u25B2", mine ? pend + " of your " + (pend === 1 ? "updates is" : "updates are") + " waiting for review" : pend + " agency " + (pend === 1 ? "update is" : "updates are") + " waiting for review",
        canReviewNow() ? "Open Agency updates to accept or reject" : "Open Agency updates to follow their review"]);
    }
    var attn = '<div class="block" id="attn"><h2>Needs attention first</h2><p class="sub">Generated from the data, most urgent first.</p><ul class="attn">' + att.map(function (a) {
      return '<li><span class="ic">' + a[0] + "</span><span>" + esc(a[1]) + "<small>" + esc(a[2]) + "</small></span></li>";
    }).join("") + "</ul></div>";

    $("ov").innerHTML = kh + '<div class="cols">' + complete + funding + "</div>" + attn;
  }

  /* ---------- Indicators ---------- */
  function renderIndicators() {
    var o = +$("f-out").value, s = $("f-status").value, q = $("f-q").value.trim().toLowerCase();
    var rs = INDS.filter(function (r) {
      return inOut(o, r[1]) && (s === "all" || status(r) === s) && (!q || (r[2] + " " + r[7] + " " + r[0]).toLowerCase().indexOf(q) > -1);
    });
    var head = "<tr><th>ID</th><th>Indicator</th><th>Lead</th><th class='num'>Baseline</th><th class='num'>Latest</th><th class='num'>Target</th><th>Progress to target</th><th>Data status</th><th>Source</th></tr>";
    var body = rs.map(function (r) {
      var L = latest(r), p = progress(r), st = status(r);
      var prog = p == null ? '<span style="color:var(--muted)">—</span>' :
        '<div class="pb" style="--c:' + oc(r[1]) + '"><div class="bar"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%"></i></div><span>' + Math.round(p * 100) + "%</span></div>";
      return "<tr><td class='id'>" + r[0] + "</td><td data-tip='" + esc(r[9] || "") + "'>" + esc(r[2]) + "</td><td>" + esc(r[7]) + "</td><td class='num'>" + fmtV(r[4], r[3]) + "</td><td class='num'>" + (L ? fmtV(L.v, r[3]) + " <span style='color:var(--muted)'>" + L.year + "</span>" : "—") + "</td><td class='num'>" + fmtV(r[5], r[3]) + "</td><td>" + prog + "</td><td><span class='pill' data-tip='" + esc(STHELP[st]) + "'><i class='sw-" + st + "'></i>" + ST[st] + "</span></td><td style='color:var(--ink2);font-size:12px'>" + esc(r[8]) + "</td></tr>";
    }).join("");
    $("ind-out").innerHTML = rs.length ?
      '<div class="tscroll"><table><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div><p class='note'>" + rs.length + " of " + INDS.length + " indicators shown. Progress runs from the baseline to the target and can exceed 100%. Hover a row for what the source says about it.</p>" :
      '<div class="block">No indicators match these filters.</div>';
  }

  /* ---------- Funding and work plan ---------- */
  function renderMoney() {
    var o = +$("m-out").value, jointOnly = $("m-joint").checked;
    var thr = state.thr;
    var ags = agencyTotals(o, thr).sort(function (a, b) { return a.rate - b.rate; });
    var rows = ags.map(function (a) {
      return '<div class="arow"><div>' + esc(a.name) + '</div><div class="rate" tabindex="0" data-tip="' + esc(a.name + ": spent " + fmtK(a.sp) + " of " + fmtK(a.av) + " available (" + Math.round(a.rate) + "%)") + '"><i class="' + (a.low ? "low" : "") + '" style="width:' + Math.min(100, a.rate).toFixed(1) + '%"></i><u style="left:' + thr + '%"></u></div><div class="fn" style="text-align:left">' + Math.round(a.rate) + "% spent" + (a.low ? " ▲ below review line" : "") + " · " + fmtK(a.unspent) + " unspent</div></div>";
    }).join("");
    var deliveryBlock = '<div class="block"><h2>Spending by agency · ' + esc(oname(o)) + ' <span class="chip">Sample</span></h2><p class="sub">Share of available funds already spent, lowest first. The black tick is the review line (' + thr + '%). Orange bars are below it.</p>' + (rows || "No funding rows for this outcome.") + "</div>";

    var acts = ACTS.filter(function (a) { return inOut(o, a[1]) && (!jointOnly || isJoint(a)); });
    var heatRows = DISTRICTS.concat(["National"]).map(function (d) {
      var tds = OUT.map(function (u) {
        var n = acts.filter(function (a) { return a[1] === u.n && a[4].indexOf(d) > -1; }).length;
        return '<td class="cell" style="--c:' + oc(u.n) + ";--n:" + Math.min(n, 4) + '"' + (n ? ' data-tip="' + esc(n + " activities: " + u.name + " in " + (d === "National" ? "no single district" : d)) + '"' : "") + ">" + (n || "–") + "</td>";
      }).join("");
      return "<tr><td>" + (d === "National" ? "National (no district focus)" : d) + "</td>" + tds + "</tr>";
    }).join("");
    var heat = '<div><h2>Who is working where <span class="chip">Sample</span></h2><p class="sub">Count of activities by district and outcome. An empty district with high need is a place to look for gaps; a crowded cell is a place to look for duplication.</p><div class="tscroll heat"><table><thead><tr><th>District</th>' + OUT.map(function (u) {
      return '<th><span class="hh" style="--c:' + oc(u.n) + '"><span class="dot"></span>' + u.n + "</span></th>";
    }).join("") + "</tr></thead><tbody>" + heatRows + "</tbody></table></div><p class='note'>" + OUT.map(function (u) { return u.n + " " + u.name; }).join(" · ") + "</p></div>";

    var SP = { on: ["✓", "On track"], late: ["▲", "Delayed"], not: ["○", "Not started"] };
    var arows = acts.map(function (a) {
      return "<tr><td><span class='hh' style='--c:" + oc(a[1]) + "'><span class='dot'></span>" + a[1] + "</span></td><td>" + esc(a[0]) + "</td><td>" + esc(a[2]) + (a[3].length ? " <span style='color:var(--ink2)'>with " + esc(a[3].join(", ")) + "</span>" : "") + "</td><td>" + esc(a[4].join(", ")) + "</td><td class='num'>" + fmtK(a[6]) + "</td><td><span class='pill'><b style='font-family:var(--font-mono)'>" + SP[a[5]][0] + "</b>" + SP[a[5]][1] + "</span></td></tr>";
    }).join("");
    var jn = acts.filter(isJoint).length;
    var table = '<div><h2>Joint work plan <span class="chip">Sample</span></h2><p class="sub">' + jn + " of " + acts.length + " activities shown involve more than one agency (" + (acts.length ? Math.round(jn / acts.length * 100) : 0) + "%).</p><div class='tscroll'><table><thead><tr><th>Outcome</th><th>Activity</th><th>Lead and partners</th><th>Districts</th><th class='num'>Budget</th><th>Status</th></tr></thead><tbody>" + (arows || "<tr><td colspan='6'>No activities match.</td></tr>") + "</tbody></table></div></div>";

    $("money-out").innerHTML = deliveryBlock + heat + table;
  }

  /* ---------- Approvals ---------- */
  function renderDelivery() {
    var open = DELIV.filter(function (d) { return d[4] < 4; });
    var stuck = stuckItems(0);
    var rows = DELIV.slice().sort(function (a, b) {
      if ((a[4] === 4) !== (b[4] === 4)) return a[4] === 4 ? 1 : -1;
      return b[5] - a[5];
    }).map(function (d) {
      var isStuck = d[4] < 4 && d[5] > state.days;
      var pipe = '<span class="pipe" aria-hidden="true">' + STAGES.map(function (s, i) {
        return '<i class="' + (d[4] === 4 || i < d[4] ? "done" : i === d[4] ? (isStuck ? "stuck" : "cur") : "") + '"></i>';
      }).join("") + "</span>";
      var when = d[4] === 4 ? "Delivered" : STAGES[d[4]] + " · " + d[5] + " days";
      return "<tr><td>" + esc(d[0]) + "</td><td>" + esc(d[1]) + "</td><td>" + esc(d[2]) + "</td><td>" + pipe + "</td><td" + (isStuck ? " class='stuck-t'" : "") + ">" + (isStuck ? "▲ " : "") + esc(when) + "</td><td class='num'>" + fmtK(d[6]) + "</td></tr>";
    }).join("");
    $("del-out").innerHTML =
      '<div class="kpis"><div class="kpi"><div class="l">Open approvals</div><div class="v">' + open.length + '</div><div class="s">' + fmtK(sum(open, function (d) { return d[6]; })) + ' in progress</div></div>' +
      '<div class="kpi"><div class="l">Waiting over ' + state.days + ' days</div><div class="v">' + stuck.length + '</div><div class="s">' + fmtK(sum(stuck, function (d) { return d[6]; })) + ' held up</div></div>' +
      '<div class="kpi"><div class="l">Longest wait</div><div class="v">' + (stuck[0] ? stuck[0][5] + " days" : "—") + '</div><div class="s">' + (stuck[0] ? esc(stuck[0][0]) : "Nothing over the line") + "</div></div></div>" +
      '<div><h2>From request to delivery <span class="chip">Sample</span></h2><p class="sub">Each row is a purchase or payment that needs a government sign-off. Filled boxes are completed stages, the orange box is where a flagged item is stuck. Sorted by waiting time.</p><div class="tscroll"><table><thead><tr><th>Item</th><th>Agency</th><th>Ministry</th><th>Stage</th><th>Now</th><th class="num">Value</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }

  /* ---------- Report ---------- */
  function draft() {
    var o = +$("r-out").value, scope = oname(o);
    var rs = INDS.filter(function (r) { return inOut(o, r[1]); });
    var c = { tracked: 0, notarget: 0, stale: 0, nodata: 0 };
    rs.forEach(function (r) { c[status(r)]++; });
    var prog = rs.map(function (r) { return { r: r, p: progress(r) }; }).filter(function (x) { return x.p != null && status(x.r) === "tracked"; }).sort(function (a, b) { return b.p - a.p; });
    var fr = fundRows(o), A = sum(fr, function (f) { return f[3]; }), S = sum(fr, function (f) { return f[4]; }), R = sum(fr, function (f) { return f[2]; });
    var ags = agencyTotals(o, state.thr), low = ags.filter(function (a) { return a.low; }).sort(function (a, b) { return b.unspent - a.unspent; });
    var acts = ACTS.filter(function (a) { return inOut(o, a[1]); });
    var jn = acts.filter(isJoint).length, late = acts.filter(function (a) { return a[5] === "late"; }), notst = acts.filter(function (a) { return a[5] === "not"; });
    var stuck = stuckItems(o);
    var t = [];
    t.push("RESULTS SUMMARY: " + scope.toUpperCase());
    t.push("As of 13 October 2026. Indicator figures come from UN reports on Botswana through 2024; funding, work plan and approvals are sample data.");
    t.push("");
    t.push("Results. " + c.tracked + " of " + rs.length + " indicators have both a target and a " + CUR + " value, so progress can be judged. " + c.notarget + " have data but no target, " + c.stale + (c.stale === 1 ? " is" : " are") + " out of date and " + c.nodata + " have no data.");
    if (prog.length) {
      t.push("Progress against target: " + prog.map(function (x) { return x.r[2].toLowerCase() + " (" + Math.round(x.p * 100) + "% of the way)"; }).join("; ") + ".");
    }
    t.push("");
    t.push("Funding and delivery. " + fmtK(A) + " is available against " + fmtK(R) + " required (a gap of " + Math.round((1 - A / R) * 100) + "%), and " + fmtK(S) + " has been spent, or " + Math.round(S / A * 100) + "% of what is available. " + DAYS_LEFT + " days remain in the year." + (low.length ? " " + low.length + " agencies are below the " + state.thr + "% review line, holding " + fmtK(sum(low, function (a) { return a.unspent; })) + " unspent; the largest are " + low.slice(0, 3).map(function (a) { return a.name + " (" + fmtK(a.unspent) + ")"; }).join(", ") + "." : " No agency is below the " + state.thr + "% review line."));
    t.push("");
    t.push("Coordination. " + jn + " of " + acts.length + " activities (" + (acts.length ? Math.round(jn / acts.length * 100) : 0) + "%) are delivered jointly by more than one agency. " + late.length + " are delayed and " + notst.length + " have not started" + (late.length + notst.length ? ": " + late.concat(notst).slice(0, 3).map(function (a) { return a[0].toLowerCase(); }).join("; ") + "." : "."));
    t.push("");
    t.push("Approvals. " + (stuck.length ? stuck.length + " approvals have waited more than " + state.days + " days, worth " + fmtK(sum(stuck, function (d) { return d[6]; })) + ". The longest are " + stuck.slice(0, 3).map(function (d) { return d[0].toLowerCase() + " (" + d[1] + ", " + d[5] + " days at " + STAGES[d[4]].toLowerCase() + ")"; }).join("; ") + "." : "No approvals have waited longer than " + state.days + " days."));
    t.push("");
    t.push("Suggested actions");
    var n = 1;
    var gaps = rs.filter(function (r) { return status(r) === "notarget"; });
    if (gaps.length) t.push(n++ + ". Agree targets for " + gaps.map(function (r) { return r[0]; }).join(", ") + " so progress can be tracked.");
    var miss = rs.filter(function (r) { var s = status(r); return s === "nodata" || s === "stale"; });
    if (miss.length) t.push(n++ + ". Ask lead agencies for current data on " + miss.map(function (r) { return r[0] + " (" + r[7] + ")"; }).join(", ") + ".");
    if (stuck.length) t.push(n++ + ". Raise the longest-waiting approvals with the ministries concerned, starting with " + stuck[0][0].toLowerCase() + ".");
    if (low.length) t.push(n++ + ". Review spending plans with " + low.slice(0, 2).map(function (a) { return a.name; }).join(" and ") + " before year-end to avoid returning funds.");
    if (n === 1) t.push("1. No urgent actions found in this scope.");
    $("r-text").value = t.join("\n");
  }

  function renderAll() { if (!AUTH.user) return; renderOverview(); renderIndicators(); renderMoney(); renderDelivery(); updateBadge(); }

  /* ---------- wiring ---------- */
  function fillSelect(id) {
    $(id).innerHTML = '<option value="0">All outcomes</option>' + OUT.map(function (o) { return '<option value="' + o.n + '">' + o.n + " " + esc(o.name) + "</option>"; }).join("");
  }
  /* ---------- access: who is signed in, what they see and what they may do ---------- */
  var SERVER = window.__MODE__ === "server";
  var ALL_TABS = ["overview", "indicators", "money", "delivery", "submit", "report"];
  var panels = { overview: "tab-overview", indicators: "tab-indicators", money: "tab-money", delivery: "tab-delivery", submit: "tab-submit", report: "tab-report" };
  var TAB_LABEL = { overview: "Overview", indicators: "Results", money: "Funding and work plan", delivery: "Delivery", submit: "Agency updates", report: "Reports" };
  var ICON = {
    overview: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/>',
    indicators: '<path d="M4 16V9M10 16V4M16 16v-4"/>',
    money: '<path d="M10 3l7 3.5-7 3.5-7-3.5L10 3z"/><path d="M3 10l7 3.5 7-3.5"/><path d="M3 13.5L10 17l7-3.5"/>',
    delivery: '<path d="M5 15L15 5M8 5h7v7"/>',
    submit: '<circle cx="10" cy="10" r="7"/><path d="M10 6.5v7M6.5 10h7"/>',
    report: '<path d="M5 3h7l3 3v11H5V3z"/><path d="M12 3v3h3M7.5 10h5M7.5 13h5"/>'
  };
  var ROLES = {
    admin: { label: "RCO administrator", tabs: ALL_TABS, submit: true, review: true,
      note: "You can see every view, submit updates for any agency, and accept or reject updates." },
    agency: { label: "Agency lead", tabs: ["overview", "indicators", "money", "submit", "report"], submit: true, review: false,
      note: "You can submit figures for your own agency and follow their review. The RCO accepts or rejects them." },
    government: { label: "Government partner", tabs: ["overview", "indicators", "delivery", "report"], submit: false, review: false,
      note: "You have read-only access to results, delivery and reports." },
    executive: { label: "Executive viewer", tabs: ["overview", "report"], submit: false, review: false,
      note: "You have read-only access to the overview and reports." }
  };
  var AUTH = { user: null };
  function roleOf() { return AUTH.user ? ROLES[AUTH.user.roleKey] : null; }
  function allowed(tab) { var r = roleOf(); return !!r && r.tabs.indexOf(tab) > -1; }
  function canSubmitNow() { var r = roleOf(); return !!r && r.submit && canWrite; }
  function canReviewNow() { var r = roleOf(); return !!r && r.review && isAdmin; }

  function buildNav() {
    var r = roleOf(), side = "", mob = "";
    ALL_TABS.forEach(function (id) {
      if (r.tabs.indexOf(id) < 0) return;
      side += '<button type="button" class="side-link" data-tab="' + id + '"><svg viewBox="0 0 20 20" aria-hidden="true">' + ICON[id] + "</svg><span>" + TAB_LABEL[id] + "</span>" +
        (id === "submit" ? '<span class="nav-badge" id="nav-pending" hidden></span>' : "") + "</button>";
      mob += '<button role="tab" data-tab="' + id + '" aria-selected="false">' + TAB_LABEL[id] + "</button>";
    });
    $("side-nav").innerHTML = side;
    $("mobile-tabs").innerHTML = mob;
  }
  function show(name, user) {
    var r = roleOf();
    if (!r) return;
    if (!panels[name] || r.tabs.indexOf(name) < 0) name = r.tabs[0];
    document.querySelectorAll("[data-tab]").forEach(function (b) {
      var on = b.dataset.tab === name;
      if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", on ? "true" : "false");
      else { b.classList.toggle("active", on); if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); }
    });
    Object.keys(panels).forEach(function (k) { $(panels[k]).hidden = k !== name; });
    try { if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name); } catch (e) {}
    if (user) window.scrollTo(0, 0);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-tab]") : null;
    if (b && AUTH.user) show(b.dataset.tab, true);
  });
  window.addEventListener("hashchange", function () {
    if (!AUTH.user) return;
    var h = ""; try { h = location.hash.slice(1); } catch (e) {}
    show(h);
  });

  function toggleMenu(open) {
    var d = $("user-menu-dropdown"), want = typeof open === "boolean" ? open : d.hidden;
    d.hidden = !want;
    $("user-menu-button").setAttribute("aria-expanded", want ? "true" : "false");
  }
  $("user-menu-button").addEventListener("click", function (e) { e.stopPropagation(); toggleMenu(); });
  document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".user-menu")) toggleMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggleMenu(false); });
  $("logout-button").addEventListener("click", function () { signOut(); });
  $("help-open").addEventListener("click", function () {
    $("help-mode").textContent = SERVER
      ? "Sign-in is checked by the server. Your role decides which views and actions you get."
      : "This is a standalone demo: accounts and roles run in your browser to show how access would work. Run server.js for sign-in that the server enforces.";
    var d = $("help"); if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  });
  $("bell").addEventListener("click", function () {
    if (!AUTH.user) return;
    show("overview", true);
    var a = $("attn");
    if (a) { a.scrollIntoView({ behavior: "smooth", block: "start" }); a.setAttribute("tabindex", "-1"); a.focus({ preventScroll: true }); }
  });

  function bootData() {
    ["f-out", "m-out", "r-out"].forEach(fillSelect);
    $("asof").textContent = "As of 13 Oct 2026 · " + DAYS_LEFT + " days to year-end";
    fillForm();
  }
  var booted = false;
  function enter(u) {
    if (!u || !ROLES[u.roleKey]) return;
    AUTH.user = { email: String(u.email || ""), name: String(u.name || u.email || "User"), initials: String(u.initials || "").slice(0, 2), roleKey: u.roleKey, agency: String(u.agency || "") };
    var me = AUTH.user, r = roleOf();
    if (!me.initials) me.initials = me.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    document.body.setAttribute("data-auth", "in");
    $("user-name").textContent = me.name;
    $("user-role").textContent = r.label + (me.agency ? ", " + me.agency : "");
    $("user-avatar").textContent = me.initials;
    $("dropdown-role").textContent = me.email;
    $("role-note").textContent = r.note;
    bootData();
    buildNav();
    if (!booted) { booted = true; initStore(); }
    setReady();
    renderAll();
    draft();
    var h = ""; try { h = location.hash.slice(1); } catch (e) {}
    show(h);
    updateBadge();
    toggleMenu(false);
    try { $("main-title").focus({ preventScroll: true }); } catch (e) {}
  }
  function signOut() {
    if (SERVER) {
      fetch("/api/logout", { method: "POST", credentials: "same-origin", headers: { "X-RL": "1", "Content-Type": "application/json" } }).catch(function () {}).then(function () { location.replace("/"); });
      return;
    }
    AUTH.user = null;
    document.body.setAttribute("data-auth", "out");
    ["ov", "ind-out", "money-out", "del-out", "q-list", "u-ctx", "u-msg", "csv-msg"].forEach(function (id) { $(id).innerHTML = ""; });
    ["r-text", "u-val", "u-src", "u-note"].forEach(function (id) { $(id).value = ""; });
    toggleMenu(false);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    var p = $("login-password"), f = $("login-email");
    if (p) p.value = "";
    if (f) f.focus();
    window.scrollTo(0, 0);
  }
  function setReady() {
    if (!AUTH.user) return;
    var can = canSubmitNow(), b = $("u-submit"), u = AUTH.user, sel = $("u-agency");
    b.disabled = !can; b.textContent = can ? "Submit for review" : "View only";
    $("csv-apply").disabled = !can;
    if (u.agency && !roleOf().review) { sel.value = u.agency; sel.disabled = true; } else { sel.disabled = false; }
    $("u-msg").textContent = can ? "" : "Your account can view updates but not submit them.";
    renderQueue();
  }
  function visibleSubs() {
    var u = AUTH.user, r = roleOf();
    if (!u || !r) return [];
    if (r.review || !u.agency) return SUBS;
    return SUBS.filter(function (s) { return s.agency === u.agency; });
  }
  function updateBadge() {
    updateBell();
    var el = $("nav-pending");
    if (!el) return;
    var n = pendingCount();
    el.textContent = n; el.hidden = n === 0;
    el.setAttribute("aria-label", n + " waiting for review");
  }
  function updateBell() {
    var d = document.querySelector(".notification-dot");
    if (d) d.hidden = !AUTH.user || !$("attn");
  }


  ["f-out", "f-status"].forEach(function (id) { $(id).addEventListener("change", renderIndicators); });
  $("f-q").addEventListener("input", renderIndicators);
  $("m-out").addEventListener("change", renderMoney);
  $("m-joint").addEventListener("change", renderMoney);
  $("m-thr").addEventListener("input", function () {
    var v = Number($("m-thr").value); state.thr = isFinite(v) ? Math.max(0, Math.min(100, v)) : 75; renderMoney(); renderOverview();
  });
  $("d-days").addEventListener("input", function () {
    var v = Number($("d-days").value); state.days = isFinite(v) && v > 0 ? v : 30; renderDelivery(); renderOverview();
  });
  $("r-draft").addEventListener("click", draft);
  $("r-copy").addEventListener("click", function () {
    var ta = $("r-text"), btn = $("r-copy");
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = "Copy text"; }, 1600); }
    function fallback() { ta.focus(); ta.select(); done("Selected, press copy"); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(function () { done("Copied"); }, fallback);
      else fallback();
    } catch (e) { fallback(); }
  });
  /* ---------- agency updates (shared through the db capability) ---------- */
  var db = null, userNS = null, myId = null, isAdmin = false, canWrite = true, shared = false, localSeq = 0;
  var SUBS = [], DEC = {};
  function subStatus(s) { var d = DEC[s.id]; return d && (d.status === "accepted" || d.status === "rejected") ? d.status : "pending"; }
  function pendingCount() { return visibleSubs().filter(function (s) { return subStatus(s) === "pending"; }).length; }
  function baseRow(id) { return BASE_INDS.filter(function (x) { return x[0] === id; })[0]; }
  function currentRow(id) { return INDS.filter(function (x) { return x[0] === id; })[0]; }
  function validSub(s) {
    return s && typeof s.value === "number" && isFinite(s.value) && typeof s.indicator === "string" && !!baseRow(s.indicator) && YEARS.indexOf(s.year) > -1;
  }
  function rebuild() {
    INDS = clone(BASE_INDS);
    SUBS.filter(function (s) { return subStatus(s) === "accepted"; }).sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); }).forEach(function (s) {
      var r = currentRow(s.indicator);
      if (r) r[6][YEARS.indexOf(s.year)] = s.value;
    });
  }

  /* ---------- server storage: same calls as the shared db, over the role-checked REST API ---------- */
  function serverDb() {
    var subs = { updates: [], decisions: [] }, errs = [], timer = null, busy = false;
    function call(path, opt) {
      opt = opt || {};
      var h = { "X-RL": "1" };
      if (opt.body) h["Content-Type"] = "application/json";
      if (opt.poll) h["X-RL-Poll"] = "1";
      return fetch(path, { method: opt.method || "GET", credentials: "same-origin", headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401) { location.reload(); throw { code: "signed_out" }; }
          if (!r.ok) throw { code: r.status === 403 ? "forbidden" : r.status === 429 ? "resource_exhausted" : r.status === 507 ? "quota_exceeded" : "server", serverMsg: j.error };
          return j;
        });
      });
    }
    function poll() {
      if (busy) return Promise.resolve();
      busy = true;
      return call("/api/updates", { poll: true }).then(function (j) {
        busy = false;
        var ups = (j.updates || []).map(function (u) { return { id: u.id, data: function () { return u; } }; });
        var decs = Object.keys(j.decisions || {}).map(function (k) { return { id: k, data: function () { return j.decisions[k]; } }; });
        subs.updates.forEach(function (cb) { cb({ docs: ups }); });
        subs.decisions.forEach(function (cb) { cb({ docs: decs }); });
      }, function (e) { busy = false; errs.forEach(function (cb) { cb(e); }); });
    }
    function start() {
      if (timer) return;
      timer = setInterval(function () { if (!document.hidden && AUTH.user) poll(); }, 8000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden && AUTH.user) poll(); });
    }
    function coll(name) {
      return {
        limit: function () { return this; },
        onSnapshot: function (cb, er) { subs[name].push(cb); if (er) errs.push(er); start(); poll(); },
        add: function (rec) { return call("/api/updates", { method: "POST", body: rec }).then(function (j) { poll(); return j; }); }
      };
    }
    return {
      collection: coll,
      doc: function (p) {
        var id = p.split("/")[1];
        return {
          set: function (o) { return call("/api/decisions", { method: "POST", body: { id: id, status: o.status } }).then(function () { poll(); }); },
          delete: function () { return call("/api/decisions", { method: "POST", body: { id: id, status: "undo" } }).then(function () { poll(); }); }
        };
      }
    };
  }
  function dbErr(er) {
    var c = er && er.code;
    if (er && er.serverMsg) return er.serverMsg;
    if (c === "quota_exceeded") return "The shared store is full. Ask the page owner to clear old updates.";
    if (c === "forbidden") return "Your account is not allowed to do this.";
    if (c === "invalid_argument") return "This view can read updates but not write them. Ask the owner for contributor access.";
    if (c === "resource_exhausted") return "Too many requests at once. Wait a moment and try again.";
    return "Could not save. Try again in a moment.";
  }
  function umsg(text, isErr) { $("u-msg").innerHTML = isErr ? "<b>Not submitted.</b> " + esc(text) : text; }

  function fillForm() {
    $("u-agency").innerHTML = AGENCIES.map(function (a) { return "<option>" + esc(a) + "</option>"; }).join("");
    $("u-year").innerHTML = YEARS.slice().reverse().map(function (y) { return "<option>" + y + "</option>"; }).join("");
    $("u-ind").innerHTML = BASE_INDS.map(function (r) { return '<option value="' + r[0] + '">' + r[0] + " · " + esc(r[2]) + "</option>"; }).join("");
    ctx();
  }
  function ctx() {
    var r = currentRow($("u-ind").value);
    if (!r) return;
    var yr = +$("u-year").value, yi = YEARS.indexOf(yr);
    $("u-unit").textContent = "(" + (r[3] === "%" ? "percent" : r[3]) + ")";
    var hist = YEARS.map(function (y, i) { return y + ": " + fmtV(r[6][i], r[3]); }).join(" · ");
    var h = "<b>" + esc(r[2]) + "</b><br>Lead: " + esc(r[7]) + " · Baseline " + fmtV(r[4], r[3]) + " · Target " + (r[5] == null ? "none set" : fmtV(r[5], r[3])) + "<br>Reported: " + esc(hist);
    var v = $("u-val").value.trim();
    if (v !== "" && isFinite(Number(v))) {
      var n = Number(v), cur = r[6][yi], prev = null;
      for (var i = yi - 1; i >= 0; i--) if (r[6][i] != null) { prev = { y: YEARS[i], v: r[6][i] }; break; }
      if (cur != null) h += "<br>This replaces " + fmtV(cur, r[3]) + " for " + yr + ".";
      if (prev && prev.v > 0 && Math.abs(n - prev.v) / prev.v > 0.5) h += '<br><span class="warn">▲ More than 50% away from ' + fmtV(prev.v, r[3]) + " in " + prev.y + ". Check the figure before you submit.</span>";
    }
    $("u-ctx").innerHTML = h;
  }
  function check(rec) {
    var r = baseRow(rec.indicator);
    if (!r) return "Choose an indicator.";
    if (YEARS.indexOf(rec.year) < 0) return "Choose a year from " + YEARS[0] + " to " + YEARS[YEARS.length - 1] + ".";
    if (!isFinite(rec.value)) return "Enter the value as a number.";
    if (rec.value < 0) return "The value cannot be negative.";
    if (r[3] === "%" && rec.value > 100) return "A percentage cannot be above 100.";
    if (r[3] === "of 6" && rec.value > 6) return "This indicator counts criteria out of 6.";
    if (!rec.source || rec.source.length < 3) return "Say where the figure comes from.";
    return "";
  }
  function save(rec) {
    if (!canSubmitNow()) return Promise.reject({ code: "forbidden" });
    if (AUTH.user.agency && !roleOf().review) rec.agency = AUTH.user.agency;
    rec.ts = Date.now();
    rec.by = shared ? myId : AUTH.user.email;
    if (shared) return db.collection("updates").add(rec).then(function () { return true; });
    rec.id = "local-" + (++localSeq);
    SUBS.push(rec); rebuild(); renderAll(); renderQueue();
    return Promise.resolve(true);
  }
  function renderQueue() {
    if (!AUTH.user) return;
    var n = { pending: 0, accepted: 0, rejected: 0 }, VS = visibleSubs();
    VS.forEach(function (s) { n[subStatus(s)]++; });
    $("q-sub").textContent = (shared ? (SERVER ? "Saved on the server and visible to the people allowed to see it. " : "Shared with everyone who opens this page. ") : "Held in this browser tab only, because shared storage is not available in this view. It is lost when you reload. ") +
      n.pending + " waiting, " + n.accepted + " accepted, " + n.rejected + " rejected." + (canReviewNow() ? "" : " You cannot accept or reject updates with this account.");
    var rows = VS.slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 50);
    if (!rows.length) {
      $("q-list").innerHTML = '<div class="empty">No updates yet. When an agency submits a figure it appears here with its source, and an editor accepts or rejects it. Accepted figures replace the value on the Results tab.</div>';
      return;
    }
    var LBL = { pending: "Waiting", accepted: "Accepted", rejected: "Rejected" };
    $("q-list").innerHTML = rows.map(function (s) {
      var r = baseRow(s.indicator), st = subStatus(s), prior = r[6][YEARS.indexOf(s.year)], id = esc(s.id);
      var btns = !canReviewNow() ? "" : st === "pending" ?
        '<button class="btn sm" data-act="accepted" data-id="' + id + '" type="button">Accept</button><button class="btn sm ghost" data-act="rejected" data-id="' + id + '" type="button">Reject</button>' :
        '<button class="btn sm ghost" data-act="undo" data-id="' + id + '" type="button">Undo</button>';
      return '<div class="qrow"><div class="qt"><b>' + esc(s.agency || "Unknown agency") + "</b> · " + esc(r[0]) + " " + esc(r[2]) +
        "<small>" + s.year + ": " + esc(fmtV(s.value, r[3])) + (prior != null ? " (published " + esc(fmtV(prior, r[3])) + ")" : "") + " · " + esc(s.source || "") + (s.note ? " · " + esc(s.note) : "") +
        " · " + new Date(s.ts || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + (s.by ? " · sent by " + esc(s.by) : "") + (DEC[s.id] && DEC[s.id].by && st !== "pending" ? " · " + LBL[st].toLowerCase() + " by " + esc(DEC[s.id].by) : "") + '</small></div><div class="qact"><span class="pill sp-' + st + '"><i></i>' + LBL[st] + '</span><div class="qbtns">' + btns + "</div></div></div>";
    }).join("");
  }
  function decide(id, act) {
    if (!canReviewNow()) return;
    if (shared) {
      var ref = db.doc("decisions/" + id);
      var p = act === "undo" ? ref.delete() : ref.set({ status: act, by: myId, ts: Date.now() });
      p.catch(function (er) { $("q-sub").textContent = dbErr(er); });
    } else {
      if (act === "undo") delete DEC[id]; else DEC[id] = { status: act, by: AUTH.user.email };
      rebuild(); renderAll(); renderQueue();
    }
  }
  function submitCsv(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var recs = [], bad = [];
    lines.forEach(function (l, i) {
      var p = l.split(",").map(function (x) { return x.trim(); });
      if (i === 0 && !/^\d/.test(p[0])) return;
      var rec = { agency: $("u-agency").value, indicator: p[0], year: +p[1], value: p[2] === "" || p[2] == null ? NaN : Number(p[2]), source: "CSV upload", note: "" };
      var err = baseRow(p[0]) ? check(rec) : "Unknown indicator ID.";
      if (err) bad.push(l + " (" + err.replace(/\.$/, "").toLowerCase() + ")"); else recs.push(rec);
    });
    if (recs.length > 100) { bad.push("only the first 100 valid rows were submitted"); recs = recs.slice(0, 100); }
    var ok = 0;
    $("csv-msg").textContent = "Submitting " + recs.length + " rows";
    recs.reduce(function (p, rec) { return p.then(function () { return save(rec).then(function () { ok++; }); }); }, Promise.resolve())
      .catch(function (er) { bad.push("stopped early: " + dbErr(er)); })
      .then(function () { $("csv-msg").innerHTML = "<b>" + ok + " submitted</b> for review, " + bad.length + " rejected." + (bad.length ? "<br>Rejected: " + bad.map(esc).join("; ") : ""); });
  }
  function listen() {
    db.collection("updates").limit(1000).onSnapshot(function (snap) {
      SUBS = snap.docs.map(function (d) { return Object.assign({}, d.data(), { id: d.id }); }).filter(validSub);
      rebuild(); renderAll(); renderQueue();
    }, function () { $("q-sub").textContent = "Live updates stopped. Reload the page to reconnect."; });
    db.collection("decisions").onSnapshot(function (snap) {
      DEC = {};
      snap.docs.forEach(function (d) { DEC[d.id] = d.data(); });
      rebuild(); renderAll(); renderQueue();
    }, function () {});
  }

  ["u-ind", "u-year"].forEach(function (id) { $(id).addEventListener("change", ctx); });
  $("u-val").addEventListener("input", ctx);
  $("u-example").addEventListener("click", function () {
    $("u-agency").value = "UNICEF"; $("u-ind").value = "2.1.1"; $("u-year").value = "2025"; $("u-val").value = "71.2";
    $("u-src").value = "Example only: Ministry of Health immunisation report"; $("u-note").value = "Invented figure to try the form"; ctx();
  });
  $("u-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("u-submit");
    if (btn.disabled) return;
    var rec = { agency: $("u-agency").value, indicator: $("u-ind").value, year: +$("u-year").value, value: $("u-val").value.trim() === "" ? NaN : Number($("u-val").value), source: $("u-src").value.trim(), note: $("u-note").value.trim() };
    var err = check(rec);
    if (err) { umsg(err, true); return; }
    btn.disabled = true;
    save(rec).then(function () {
      umsg("<b>Submitted.</b> " + esc(rec.indicator) + " for " + rec.year + " is in the queue for review.", false);
      $("u-val").value = ""; $("u-note").value = ""; ctx();
    }, function (er) { umsg(dbErr(er), true); }).then(function () { btn.disabled = !canSubmitNow(); });
  });
  $("q-list").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("button[data-act]") : null;
    if (b) decide(b.getAttribute("data-id"), b.getAttribute("data-act"));
  });
  $("csv-apply").addEventListener("click", function () { submitCsv($("csv").value); });
  $("csvfile").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () { $("csv").value = String(rd.result).slice(0, 200000); };
    rd.readAsText(f);
  });
  function initStore() {
    if (SERVER) {
      var rl = roleOf();
      db = serverDb(); shared = true; myId = AUTH.user.email; isAdmin = !!rl.review; canWrite = !!rl.submit;
      listen(); setReady();
      return;
    }
    var cl = window.claude;
    function local() { shared = false; db = null; isAdmin = true; setReady(); }
    if (!cl || !cl.use) { local(); return; }
    Promise.all([cl.use("db"), cl.use("user")]).then(function (r) {
      db = r[0]; userNS = r[1];
      if (!db) { local(); return; }
      shared = true;
      var q = userNS ? Promise.all([userNS.id(), userNS.canEdit(), userNS.can("data.write")]) : Promise.resolve([null, false, null]);
      return q.then(function (v) { myId = v[0]; isAdmin = !!v[1]; canWrite = v[2] !== false; listen(); setReady(); });
    }).catch(local);
  }

  /* ---------- export and print ---------- */
  function csvCell(v) {
    var t = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
    return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  }
  function exportIndicators() {
    var head = ["id", "outcome", "indicator", "unit", "baseline", "target"].concat(YEARS.map(String), ["latest", "latest_year", "progress_pct", "data_status", "lead_agency", "source", "note"]);
    var rows = INDS.map(function (r) {
      var L = latest(r), p = progress(r);
      return [r[0], r[1], r[2], r[3], r[4], r[5]].concat(r[6], [L ? L.v : "", L ? L.year : "", p == null ? "" : Math.round(p * 100), ST[status(r)], r[7], r[8], r[9] || ""]);
    });
    var text = [head].concat(rows).map(function (l) { return l.map(csvCell).join(","); }).join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
    a.download = "results-layer-indicators-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  $("ind-export").addEventListener("click", exportIndicators);
  function fillPrint() { $("r-printed").textContent = $("r-text").value; }
  window.addEventListener("beforeprint", fillPrint);
  $("r-print").addEventListener("click", function () { fillPrint(); window.print(); });

  /* keep the server session alive while the person is actually using the page */
  if (SERVER) {
    var lastPing = Date.now();
    ["click", "keydown"].forEach(function (ev) {
      document.addEventListener(ev, function () {
        if (!AUTH.user || Date.now() - lastPing < 5 * 60 * 1000) return;
        lastPing = Date.now();
        fetch("/api/ping", { method: "POST", credentials: "same-origin", headers: { "X-RL": "1", "Content-Type": "application/json" }, body: "{}" }).catch(function () {});
      }, true);
    });
  }

  window.RL = { enter: enter, signOut: signOut };
  if (window.__SESSION__) enter(window.__SESSION__);
})();
