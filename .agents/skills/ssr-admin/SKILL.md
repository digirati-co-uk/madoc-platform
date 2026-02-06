---
name: ssr-admin
description: Work on Madoc TS admin SSR pipeline, HTML template injection, and admin render routing. Use when changing admin SSR behavior, template tokens, or admin SSR data wiring in services/madoc-ts.
---

# Admin SSR (Madoc TS)

## Goal
Document the admin SSR flow so template injection and admin render output remain consistent.

## Scope
- Admin SSR route handler
- Admin template token injection
- Admin SSR data wiring (user, plugins, locales)

## Non-scope
- Site SSR flow
- Frontend component implementation
- Non-SSR admin routes

## Key Entry Points
- `services/madoc-ts/src/routes/frontend/admin-frontend.ts`
- `services/madoc-ts/src/frontend/admin/server.tsx`
- `services/madoc-ts/src/admin.html`

## Architecture Summary (Based on Source)
- `admin-frontend.ts` enforces `site.admin` scope and redirects to site root when missing.
- SSR uses `frontend/admin/server` to render and injects `<!--ssr-outlet-->` and `<!--ssr-head-->` tokens.
- Development SSR uses Vite dev server and React refresh; production uses `admin.html` template replacement.

## Quick Start Workflow
1. Review `services/madoc-ts/src/routes/frontend/admin-frontend.ts` for SSR request handling and auth checks.
2. Inspect `services/madoc-ts/src/frontend/admin/server.tsx` for render inputs and output shape.
3. Confirm `services/madoc-ts/src/admin.html` token locations for SSR injection.

## Common Tasks
- Add new data passed into admin SSR render
- Update admin HTML template tokens
- Adjust auth/redirect behavior for admin SSR

## Pitfalls
- Mismatched template tokens causing blank SSR output
- Missing scope checks and leaking admin content
- Updating dev SSR scripts without matching Vite port

## Suggested Checks
- Admin SSR request in production mode
- Admin SSR request with missing `site.admin` scope
