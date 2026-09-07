---
name: madoc-documentation
description: Seeded Madoc feature demonstrations and documentation screenshots using the repository Playwright helper. Applies when scenarios or captured documentation are the deliverable; excludes ordinary UI testing and prose-only docs.
---

# Madoc Documentation

Read `services/madoc-ts/documentation/README.md` for setup and the scenario API. Reuse `services/madoc-ts/tools/documentation.mjs`.

## Run a scenario

1. From `services/madoc-ts`, use Node 24 and add a plain `.mjs` scenario in `documentation/scenarios/`. Reuse `createProject`, `createUser`, `importManifest`, `login`, and `waitForTask`; use session `page` or `api` for scenario-specific steps.
2. Keep `MADOC_CLIENT_ID` and `MADOC_CLIENT_SECRET` in the ignored `.env`; the helper loads it. Do not print or commit credentials. If unavailable, prepare the scenario and report that the authenticated run remains unverified.
3. Default to `https://madoc.local` and disposable documentation data. Scenarios leave data behind, and `createUser` resets existing accounts' passwords and roles: use documentation-only identities. Another installation requires explicit user authorization.
4. Run `pnpm docs:screenshot documentation/scenarios/<name>.mjs`. Set `MADOC_SCREENSHOT_DIR=../../docs` when the requested artifact belongs in top-level `docs`.
5. Inspect each generated PNG and correct the scenario or layout before delivery.

## Helper boundaries

- Use `createUser` for activation and interrupted-run recovery, and `login` for role-specific sessions. Do not duplicate activation/reset flows in scenarios.
- Navigation waits for `#react-component.react-loaded`, then removal of `body.dev-loading`. The Vite banner is CSS, not locatable text. Add only scenario-specific readiness checks, without arbitrary sleeps.
- `session.screenshot()` handles hydration, animations, caret hiding, and output directories. Bearer-backed browser sessions also receive the JWT cookie required by client hydration; API credentials stay on the configured Madoc origin.
