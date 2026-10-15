# Demo script: 12 minutes for a mixed panel

**Goal of the session:** leave with agreement to run a 90-day pilot, not with applause for a dashboard.

**Before you start (5 minutes)**
- Use the live demo link or `dist/index.html`, or run the server on your laptop (`npm run build && npm start`). Have a second browser profile ready so you can show two roles side by side.
- Load the page once. Check the dark "Demo mode" bar shows. Close other tabs.
- No internet? Everything works offline in demo mode. The server mode needs only your laptop.
- Know your one-line summary: *"The cooperation framework has 27 indicators. Only 3 of them can be judged for progress today. This tool shows the gaps and gives agencies one place to close them."*

**What is real and what is sample** (say this early, once, plainly)
- Real: the 27 indicator names, IDs, baselines, values and sources, taken from the UNSDCF 2022–2026 final evaluation (Feb 2026), the UN Botswana 2024 results report and the UNDP country programme evaluation (Jan 2026).
- Sample, tagged "Sample" on screen: funding by outcome, work plan, approvals and delivery. They stand in for data the panel's agencies already hold.

---

## 1. The problem on one screen (2 min) — sign in as RCO administrator

Click **RCO administrator**. Overview opens.

- Point at the first card: **3 of 27 indicators have a target and current data.** "Everything else is either missing a target, out of date, or has no data."
- Point at the outcome bars: grey and dashed segments are the gaps. "Gender equality: 1 of 7 tracked. Food, land and climate: 0 of 4."
- Scroll to **Needs attention first**. "This list writes itself from the data, most urgent first."

*Say:* "None of this is a new report. It is the existing numbers, put where the gaps are visible."

## 2. Drill into evidence (2 min) — Results tab

- Open **Results**. Search `women`. Show a row: baseline, latest, target, source, note.
- Hover an indicator name for what the source says. "Every figure carries where it came from."
- Click **Download all as CSV**. "Your data is never locked in."

## 3. Money and delivery (2 min) — Funding and work plan, then Delivery (sample)

- "Sample" tags are on screen. Show spending by agency against the review line, and the unspent amount below it.
- Delivery: approvals waiting longest, with who holds them.

*Say:* "These two views are sample data. In the pilot they show only the numbers agencies choose to share."

## 4. The key moment: an agency closes a gap (3 min)

1. In a second browser profile, sign in as **Agency lead (UNICEF)**. Show the sidebar has fewer items. "UNICEF sees what it needs."
2. Open **Agency updates**. Note the agency is **locked to UNICEF**.
3. Click **Fill an example** (or enter a value). Show the live context line: baseline, target, previous values, and a warning if the figure jumps more than 50%.
4. Submit. Show the message: "Submitted… in the queue for review."
5. Back as **RCO administrator**: the badge on **Agency updates** shows 1. Open it. Show sender, source, date.
6. Click **Accept**. Open **Results**: the figure has replaced the old value, and the progress and status moved.
7. If in server mode: reload the page. "It is still there. It is saved." Open the audit log: `GET /api/audit` shows who submitted and who accepted.

*Say:* "Submitting is not publishing. The RCO decides. Everyone sees who did what."

## 5. Who sees what (1 min)

- Sign in as **Government partner**: four views, read only. Sign in as **Executive viewer**: two views.
- Open **Who can do what** in the sidebar.
- Try the **Agency updates** URL as the government partner: you are sent to the overview. In server mode a direct request to submit is refused with 403 and logged.

## 6. The ask (2 min)

"We want to run this for 90 days with the RCO, three agencies and one ministry. We need: a host, accounts for about 10 people, a named data owner at each agency, and a security and data protection review. In return you get a working view of results and gaps, and a clear decision at day 90."

Hand over [`PILOT_PROPOSAL.md`](PILOT_PROPOSAL.md).

---

## If something goes wrong

| Problem | Do this |
|---|---|
| Sign-in fails in server mode | Check the password you printed on first run. After five failures the account waits 15 minutes. Use demo mode instead. |
| Page looks unstyled | You opened the wrong file. Use `dist/index.html`, not files in `src/`. |
| Nothing in the queue after submit | In demo mode updates live in one browser tab. Submit and review in the **same** tab (sign out and in as the administrator). |
| A question you cannot answer | Say so and write it down. Use [`PANEL_QA.md`](PANEL_QA.md). Do not guess about UN systems or policy. |

## Do not say

- That the funding, work plan or delivery numbers are real.
- That this is an official UN tool, or endorsed by any agency.
- That it is "secure" without saying what has and has not been reviewed. Say: "It has been tested by its builder; an independent review is part of the pilot."
- That it connects to UN systems today. It does not.
