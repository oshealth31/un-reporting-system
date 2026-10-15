# Architecture

## Overview

    Browser                                   Server (Node, no dependencies)
    ┌──────────────────────────┐              ┌───────────────────────────────┐
    │ Signed out: login page   │  POST /api/login ─────────►  check password, rate limit,
    │ (no data, no app code)   │  ◄── session cookie            create session, audit
    │                          │
    │ Signed in: one-page app  │  GET /  ──────────────────►  app page + user details
    │  views by role           │  GET /api/updates (poll) ──►  only what that role may see
    │  indicator data embedded │  POST /api/updates ────────►  validate, check role+agency,
    │  accepted updates applied│  POST /api/decisions ──────►  admin only, save, audit
    └──────────────────────────┘                              var/ users, store, audit.log

The page holds the 27 indicators and the sample data. Agency updates and decisions live on the server. When the page loads, it fetches the updates the signed-in role may see and applies the **accepted** ones on top of the indicators. That is how an accepted figure appears in every view.

## Modes

| Mode | How it runs | Data | Use for |
|---|---|---|---|
| Demo | Open `dist/index.html` or host it as a static page | Updates stay in the tab and reset on reload. Accounts are simulated in the browser. | Presentations. Not secure. |
| Server | `node server/server.js` | Updates and decisions saved in `var/store.json`. Accounts in `var/users.json`. Audit in `var/audit.log`. | Pilot. |

## Roles

| Role | Views | Submit | Accept or reject |
|---|---|---|---|
| RCO administrator | All six | Any agency | Yes |
| Agency lead | Overview, Results, Funding and work plan, Agency updates, Reports | Own agency only | No |
| Government partner | Overview, Results, Delivery, Reports | No | No |
| Executive viewer | Overview, Reports | No | No |

## API

| Request | Who | Purpose |
|---|---|---|
| `POST /api/login`, `/api/logout` | Anyone, session | Sign in and out |
| `GET /api/me` | Signed in | Current user |
| `POST /api/ping` | Signed in | Keep the session alive while in use |
| `GET /api/updates` | Signed in | Updates and decisions this role may see |
| `POST /api/updates` | Admin, agency lead | Submit a figure (validated, agency enforced) |
| `POST /api/decisions` | Admin | Accept, reject or undo |
| `GET /api/audit` | Admin | Last 300 events |
| `GET /healthz` | Anyone | Liveness check |

All POSTs need `X-RL: 1`, `Content-Type: application/json` and a same-origin request.

## Source

| Path | What |
|---|---|
| `src/html/` | Login page, app shell, view sections |
| `src/styles/` | Base styles and shell styles |
| `src/js/login.js` | Sign-in logic |
| `src/js/app.js` | The app: data, views, roles, update queue, export, server adapter |
| `src/demo-users.json` | Demo accounts (stripped from every page the server sends) |
| `scripts/build.js` | Assembles everything into `dist/index.html` with marker comments |
| `server/server.js` | Server and account commands |
| `data/indicators.csv` | The 27 indicators with sources (also used by the server to validate updates) |

Marker comments in `dist/index.html` (`<!--@login-->`, `<!--@app-->`, `<!--@demo-->`, and the script markers) let the server send the login page, or the app, and never the demo accounts, from one source file.

## Data sources

UNSDCF 2022–2026 final evaluation (Feb 2026), UN Botswana 2024 results report, UNDP country programme evaluation (Jan 2026). Source and note are on every row of `data/indicators.csv`.
