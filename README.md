# Results Layer

A shared view of results, funding and delivery for the UN in Botswana, with role-based sign-in and agency data entry. Built to be piloted with the Resident Coordinator's Office (RCO), a few agencies and a government partner.

**Status: pilot prototype.** Independent work, not an official UN product. Results come from published UN reports on Botswana; funding, work plan and delivery figures are invented samples and are labelled as such in the app.

## Why it exists

The 2022–2026 cooperation framework tracks 27 indicators. In this app only **3 of 27** have both a target and a current value, so for most outcomes nobody can say whether they are on course. Results Layer puts the indicators, the money and the delivery status on one screen, shows where the gaps are, and lets agencies submit figures that the RCO reviews and accepts.

## Try it

| What | How |
|---|---|
| **Live demo, no install** | Open the GitHub Pages site for this repo (see `docs/DEPLOYMENT.md`), or open `dist/index.html` after `npm run build`. Pick a demo role. Accounts are simulated in the browser. |
| **Real sign-in and saved updates** | `npm run build && npm start`, then open http://127.0.0.1:3000. First run prints the sample accounts' passwords once. |

Needs Node 18 or later. There are no dependencies to install.

## What you get

- **Sign-in required for everything.** The server sends the sign-in page only, until a valid session exists.
- **Four roles:** RCO administrator, agency lead, government partner, executive viewer. The server decides who can submit and who can accept or reject.
- **Results** for 27 indicators with source on every row, data-status, progress to target, CSV download.
- **Funding and work plan, delivery, overview** with the gaps called out first.
- **Agency updates:** a form and CSV upload with checks (range, units, source required), a review queue, and accepted figures flow into every view.
- **Audit log** of sign-ins, submissions, decisions and refused actions.
- **Reports:** a drafted summary that always matches the figures, copy or print to PDF.

## Documents

| For | Read |
|---|---|
| Presenting to the panel | [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md), [`docs/PANEL_QA.md`](docs/PANEL_QA.md) |
| Agreeing a pilot | [`docs/PILOT_PROPOSAL.md`](docs/PILOT_PROPOSAL.md) |
| Security and data protection | [`SECURITY.md`](SECURITY.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Running it | [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| What comes next | [`docs/ROADMAP.md`](docs/ROADMAP.md) |

## Commands

    npm run build      assemble src/ into dist/index.html
    npm test           build, then run the server tests (15 tests, no dependencies)
    npm start          run the server
    npm run fonts      download the typefaces into src/fonts (needs internet and npm)

    node server/server.js users
    node server/server.js adduser anna@unicef.org agency UNICEF --name "Anna Moyo"
    node server/server.js passwd admin@unbotswana.org
    node server/server.js remove someone@example.org

## Layout

    src/            page source: styles, HTML fragments, scripts, demo accounts
    scripts/        build.js, fetch-fonts.sh
    server/         server.js (sign-in, API, audit log, accounts)
    data/           indicators.csv: the 27 indicators with sources
    test/           server tests
    docs/           demo script, Q&A, pilot proposal, architecture, deployment, roadmap
    dist/           build output (not committed)
    var/            accounts, saved updates, audit log (not committed)

## Licence

MIT, see [`LICENSE`](LICENSE). The owner may choose a different licence before publishing.
