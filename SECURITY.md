# Security

## Reporting a problem

Open a private security advisory on GitHub (Security tab, "Report a vulnerability") or email the maintainer listed in the repository profile. Please do not post details in a public issue. Expect an acknowledgement within a few working days.

## Status

This is a **pilot prototype**. It has had no independent security review, penetration test or accessibility audit. Do not put real or sensitive data in it until a review is done.

## What is in place

| Area | Control |
|---|---|
| Access | Server sends only the sign-in page until a valid session exists. No data, app code or demo accounts are included in that page. |
| Passwords | scrypt with per-user salt. Generated passwords are 16 characters. Chosen passwords need 12 or more. Wrong email and wrong password give the same message and take similar time. |
| Sessions | Random 256-bit token in an HttpOnly, SameSite=Strict cookie, Secure over HTTPS. Idle timeout (60 minutes by default), 8-hour limit, ended by logout or password change. Background polling does not keep a session alive. |
| Brute force | 5 failures per address and email, and 20 per address across emails, then a 15-minute wait. |
| Forged requests | Every POST needs a custom header, JSON content type, and a same-origin check. |
| Authorisation | Enforced on the server for every API call: only admins and agency leads submit; agency leads only for their agency; only admins decide; pending updates are visible only to the sending agency and admins. |
| Input | Server validates indicator, year, value, unit range, agency and text length. All text shown in the page is escaped. CSV export neutralises spreadsheet formulas. |
| Transport | Set `RL_TRUST_PROXY=1` and `RL_REQUIRE_HTTPS=1` behind a TLS proxy for redirect, Secure cookie and HSTS. |
| Browser | Content security policy with a per-request nonce and no third-party sources, frame blocking, no-store caching, no referrer, restricted permissions. No fonts or scripts load from other sites. |
| Audit | Append-only log of sign-ins, failures, lockouts, submissions, decisions and refused actions. Readable by admins only. Passwords are never logged. |
| Supply chain | No third-party packages at runtime or build time. |
| Tests | 15 automated server tests cover these controls (`npm test`). |

## Known limits (honest list)

| Limit | Why it matters | Planned fix |
|---|---|---|
| No single sign-on or second factor | Accounts rely on one password | OIDC/SAML with the UN identity provider, then MFA |
| Whole dataset is sent to every signed-in user; roles hide views | A technical user could read views their role hides | Per-role data endpoints from the server |
| Data kept in plain JSON files on one server | No concurrent writers, no encryption at rest, manual backup | Database, encrypted storage, backups |
| Sessions in server memory | A restart signs everyone out; no multi-server use | Shared session store |
| Rate limits in memory | Reset on restart | Shared store or proxy-level limits |
| Audit log is a local file | Anyone with server access can edit it | Ship logs to a protected store |
| No password reset flow | Admin changes passwords by command line | Admin-driven reset with forced change |
| First-run passwords print to the console | May end up in logs | Forced change at first sign-in |
| Inline style attributes allowed by the CSP | Weakens style injection protection | Move inline styles to classes |
| Typefaces default to system fonts | None for security | `npm run fonts` self-hosts them |
| No independent review | Unknown unknowns | Part of the pilot plan |

## Data held

Account name, work email, role and agency; agency updates; sign-in time and IP address in the audit log. No beneficiary or case-level data.
