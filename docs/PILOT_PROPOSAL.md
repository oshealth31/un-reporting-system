# Pilot proposal: Results Layer for the UN in Botswana

*Draft for discussion. Roles, dates and names in square brackets are for the panel to fill in.*

## The decision we are asking for

Agree to a **90-day pilot** with the Resident Coordinator's Office (RCO), three agencies and one government partner, with a go / adjust / stop decision at day 90.

## The problem

The 2022–2026 cooperation framework tracks 27 indicators. In the current data, **3 of 27** have both a target and a current value. For the rest, nobody can say whether an outcome is on course. Funding, work plan and delivery are held in separate places, so gaps and stalled approvals are found late.

## What the pilot tests

1. Do agencies supply current figures when there is one simple place to do it?
2. Does the RCO get a view it trusts, faster than assembling it by hand?
3. Do partners find the shared picture useful, and is the access model acceptable?
4. Can the tool run safely where the UN is willing to host it?

## Scope

| In | Out |
|---|---|
| The 27 indicators of the current framework | Beneficiary or case-level data |
| Agency updates with source, checks and RCO review | Changes to any official UN system |
| Funding, work plan and delivery views using data agencies choose to share | Automatic feeds from other systems |
| Four roles, audit log, CSV export, printable summary | Public access |

## Who is involved

| Role | Who | Time |
|---|---|---|
| Sponsor | [RC or deputy] | 30 minutes every two weeks |
| Product owner | [RCO results or data officer] | About half a day a week |
| Agency focal points (3) | [agencies] | About an hour a week each |
| Government partner (1) | [ministry focal point] | An hour every two weeks |
| IT and security reviewer | [UN or partner IT] | A review in weeks 2–4 |
| Builder | Project team | Setup, support, fixes, weekly check-in |

## What the UN provides

- A host, behind HTTPS, that the UN approves (a small server or container is enough).
- About ten accounts, and a named owner for each agency's figures.
- A security and data protection review before real figures go in.
- Agreement on which sample data to replace first.

## Timeline

| Weeks | What happens | Output |
|---|---|---|
| 0–2 | Choose host. Create accounts. Load the 27 indicators and agree the review rules. Security and data protection review starts. | Running, reviewed instance |
| 3–6 | Three agencies submit current figures. RCO reviews weekly. Partners get read access. | First round of accepted figures |
| 7–10 | Replace sample funding and delivery with agency-shared data. Test the printable summary on a real report. | Second round, a real summary |
| 11–12 | Measure against the success measures. Gather feedback. Decide. | Pilot report and recommendation |

## Success measures (proposed, to be agreed)

| Measure | Starting point | Target at day 90 |
|---|---|---|
| Indicators with a target and current data | 3 of 27 | [to agree, e.g. at least 10 of 27] |
| Agency updates accepted within 5 working days | Not measured | [to agree, e.g. 80%] |
| Time for the RCO to produce a results summary | [measure in week 0] | [to agree] |
| Pilot users who say it is useful (short survey) | Not measured | [to agree] |
| Security findings rated high left open | Not measured | 0 |

## Risks and how we handle them

| Risk | Handling |
|---|---|
| Agencies see it as more reporting | Measure effort. Allow CSV upload. Stop or adjust at day 45 if effort is higher than today's route. |
| Data quality | Range and unit checks, source required, RCO review. |
| Security or data protection concern | Review before real data. No personal beneficiary data. Hosting only where approved. Audit log. |
| Single builder | Open code, no dependencies, one-command build, handover session in week 12. |
| Pilot stalls | Fortnightly sponsor check-in. Day-45 checkpoint. |

## Day-90 outcomes

- **Go:** adopt, with the roadmap items needed for production (single sign-on, database, backups, independent review, support arrangement). See [`ROADMAP.md`](ROADMAP.md).
- **Adjust:** extend by 30–60 days with agreed changes.
- **Stop:** export all data as CSV, close accounts, delete the instance.

## No lock-in

The code is open and has no third-party dependencies. All data exports as CSV. Any UN or partner developer can run it.
