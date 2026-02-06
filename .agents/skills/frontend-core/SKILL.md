---
name: frontend-core
description: Work on Madoc TS frontend structure for site and admin. Use when changing React routes, SSR render entrypoints, shared utilities, or component organization in services/madoc-ts.
---

# Frontend Core (Madoc TS)

## Overview
Describe the site/admin frontend layout, route construction, SSR entrypoints, and shared utilities used across the UI.

## Key Entry Points
- Frontend root: `services/madoc-ts/src/frontend/`
- Site app: `services/madoc-ts/src/frontend/site/`
- Admin app: `services/madoc-ts/src/frontend/admin/`
- Shared UI/utilities: `services/madoc-ts/src/frontend/shared/`
- Theme definitions: `services/madoc-ts/src/frontend/themes/`
- Site SSR entry: `services/madoc-ts/src/frontend/site/server.ts`
- Admin SSR entry: `services/madoc-ts/src/frontend/admin/server.tsx`
- Site routes: `services/madoc-ts/src/frontend/site/routes.tsx`
- Admin routes: `services/madoc-ts/src/frontend/admin/routes.tsx`

## Architecture Summary (Based on Source)
- Site and admin are separate React apps with their own `client` and `server` entrypoints.
- SSR is created via `createServerRenderer` in `src/frontend/shared/utility/create-server-renderer.tsx`.
- Route definitions are React Router `RouteObject` structures (site uses a `createRoutes` factory).
- Site uses nested route structures for collections/manifests/canvas/page routing.
- Admin uses route definitions in `admin/routes.tsx` and SSR in `admin/server.tsx`.

## Styling Policy
- Tailwind is preferred for new and updated UI.
- Styled-components are being phased out.
- If you must modify a styled-components component, consider creating a 100% API-compatible alternative using Tailwind.
- Keep visual behavior extremely similar (spacing can map to nearest Tailwind sizes).

## Quick Start Workflow
1. Identify whether your change is **site** or **admin** and start in the correct subfolder.
2. For routing changes:
   - Site: update `site/routes.tsx` and corresponding loader or page components.
   - Admin: update `admin/routes.tsx` and related components.
3. For SSR changes, inspect `site/server.ts` or `admin/server.tsx` and `create-server-renderer.tsx`.
4. For shared behavior, check `frontend/shared/` utilities before duplicating logic.

## Common Tasks
- Add a new page or route
- Update a loader or route data fetch
- Adjust shared UI utility
- Modify SSR behavior or data prefetching

## Pitfalls
- Updating a route without updating its loader or data fetch logic
- Mixing site/admin components or routes
- Forgetting to update both server and client entrypoints when changing SSR behavior

## Suggested Checks
- Run a local SSR request for a site page
- Run a local SSR request for an admin page
- Verify the route renders in the client after hydration
