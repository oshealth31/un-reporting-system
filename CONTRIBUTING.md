# Contributing

1. `npm test` must pass. It builds the page and runs the server tests.
2. Page source is in `src/`. Edit there, never in `dist/`.
3. Keep the app free of third-party packages and third-party requests.
4. Any change to who can see or do something needs a test in `test/server.test.js` and a line in `docs/ARCHITECTURE.md`.
5. Real figures need a source in `data/indicators.csv`. Sample data must carry the "Sample" tag on screen.
6. Report security problems privately, see `SECURITY.md`.
