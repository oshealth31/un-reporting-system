# Deployment

## On your own computer

    npm run build
    npm start
    # http://127.0.0.1:3000

The first run creates four sample accounts and prints their passwords once. Replace them before anyone else uses the instance:

    RL_PASSWORD='a-long-password-12+' node server/server.js passwd admin@unbotswana.org
    node server/server.js adduser anna@unicef.org agency UNICEF --name "Anna Moyo"

## Settings

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | 3000 | Port |
| `HOST` | 127.0.0.1 | Use `0.0.0.0` in a container |
| `RL_DATA_DIR` | `./var` | Accounts, saved updates and audit log live here. Back it up. |
| `RL_TRUST_PROXY` | off | Set to `1` behind a proxy that sets `X-Forwarded-For` and `X-Forwarded-Proto` |
| `RL_REQUIRE_HTTPS` | off | Set to `1` to redirect plain HTTP to HTTPS |
| `RL_COOKIE_SECURE` | off | Set to `1` to always mark the cookie Secure |
| `RL_IDLE_MIN` | 60 | Idle sign-out in minutes |

## Behind HTTPS (the pilot setup)

Run the app on a private port and put a TLS proxy in front.

Caddy:

    pilot.example.org {
      reverse_proxy 127.0.0.1:3000
    }

Then start with:

    RL_TRUST_PROXY=1 RL_REQUIRE_HTTPS=1 npm start

With a trusted proxy the server marks the cookie Secure, sends HSTS and uses the real client address for lockouts. Only set `RL_TRUST_PROXY=1` when a proxy you control is in front; otherwise clients can fake their address.

## Docker

    docker build -t results-layer .
    docker run -p 127.0.0.1:3000:3000 -v rl-data:/app/var results-layer
    docker run --rm -v rl-data:/app/var results-layer node server/server.js users

## Static demo on GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes `dist/` as a demo-mode site. In the repo settings choose **Pages → Source → GitHub Actions**. The site shows the demo ribbon and uses simulated accounts. **Do not put real data on it.** Use it for presentations only.

## Self-hosted typefaces

The app falls back to system fonts. To use IBM Plex and Schibsted Grotesk without loading anything from other sites, run `npm run fonts` on a machine with internet, then `npm run build`. Both are under the SIL Open Font License.

## Backups and upgrades

- Back up `RL_DATA_DIR` (`users.json`, `store.json`, `audit.log`). Copy while the server is idle, or just copy: writes are atomic.
- To upgrade, pull the repo, run `npm test && npm run build`, and restart. Sessions end on restart.
- To stop the pilot: download the indicator CSV from the Results tab, keep `audit.log` for the record, then delete the data directory.
