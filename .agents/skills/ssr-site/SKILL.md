---
name: ssr-site
description: Work on Madoc TS site SSR pipeline, HTML template injection, and site render data wiring. Use when changing site SSR behavior, template tokens, or site SSR data wiring in services/madoc-ts.
---

# Site SSR (Madoc TS)

## Goal
Document the site SSR flow so template injection and SSR render data stay consistent.

## Scope
- Site SSR route handler
- Site template token injection
- Site SSR data wiring (theme, slots, locales)

## Non-scope
- Admin SSR flow
- Frontend component implementation
- Non-SSR site routes

## Key Entry Points
- `services/madoc-ts/src/routes/frontend/site-frontend.ts`
- `services/madoc-ts/src/frontend/site/server.ts`
- `services/madoc-ts/src/site.html`

## Architecture Summary (Based on Source)
- `site-frontend.ts` builds SSR inputs (theme, slots, locales, user) and renders via `frontend/site/server`.
- SSR injection uses `<!--ssr-outlet-->` and `<!--ssr-head-->` tokens in `site.html`.
- Development SSR injects Vite dev scripts and a site stylesheet; production uses template replacement.

## Quick Start Workflow
1. Review `services/madoc-ts/src/routes/frontend/site-frontend.ts` for SSR input wiring and theme resolution.
2. Inspect `services/madoc-ts/src/frontend/site/server.ts` for render options and output shape.
3. Confirm `services/madoc-ts/src/site.html` token locations for SSR injection.

## Common Tasks
- Add new data passed into site SSR render
- Update site HTML template tokens
- Adjust theme or slot resolution logic

## Pitfalls
- Mismatched template tokens causing blank SSR output
- Incorrect theme resolution leading to stale theme cache
- Updating dev SSR scripts without matching Vite port

## Suggested Checks
- Site SSR request in production mode
- Site SSR request with theme override and slots
