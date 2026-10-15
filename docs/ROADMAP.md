# Roadmap

Ordered by what a UN host is likely to require. Items marked *depends* need a decision from the UN's IT or data protection teams.

## Done in this version

- Sign-in required for the whole app, four roles
- Server-side role checks for submit and review
- Saved agency updates, review queue, reviewer shown
- Audit log, lockouts, session limits, HTTPS settings, no third-party requests
- CSV export, printable summary, demo ribbon
- 15 automated server tests, CI, Docker, Pages demo

## Pilot (weeks 0–12)

| Item | Why |
|---|---|
| Independent security review | Nobody but the builder has looked at it |
| Accessibility check (WCAG 2.1 AA) with assistive technology | Required for most UN products |
| Data protection review | Confirm what is held and where |
| Replace sample funding, work plan and delivery with agency data | Turns the demo into a working tool |
| Forced password change at first sign-in; admin reset | Remove first-run password risk |
| Weekly feedback loop and usage measures | Needed for the day-90 decision |

## Adoption (after a "go")

| Item | Notes |
|---|---|
| Single sign-on (OIDC or SAML) and MFA | *depends* on the UN identity provider |
| Per-role data endpoints | Stop sending the whole dataset to every user |
| Database (for example PostgreSQL) instead of files | Concurrency, backups, encryption at rest |
| Shared session and rate-limit store | Run more than one server |
| Logs shipped to a protected store | Tamper resistance |
| Backups, monitoring, alerting, support arrangement | Operations |
| Data exchange with UN INFO or other systems (CSV import first, API later) | *depends*: not verified what the host system offers |
| Indicator management screen for the RCO | Today indicators come from a file |
| Multilingual interface | *depends* on audience |
| Named product owner and governance | Who decides changes |

## Ideas, not commitments

- Drafting the results summary with a language model from the same data, with a person approving the text
- Alerts when an indicator has had no update for a set time
- Comparison between framework cycles
