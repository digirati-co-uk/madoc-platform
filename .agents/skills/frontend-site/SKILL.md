---
name: frontend-site
description: Work on Madoc TS site UI structure, React routes, and site-specific SSR behaviors. Use when adding or updating site pages, loaders, or site theme usage in services/madoc-ts.
---

# Frontend Site (Madoc TS)

## Goal
Document the site-specific React app structure, route setup, and SSR entrypoints so changes to the public site are consistent and safe.

## Scope
- Site React app structure and routing
- Site SSR entrypoints and data loaders
- Site-specific layout and shared site UI

## Non-scope
- Admin UI and admin routes
- Global routing or backend API handlers
- Theme extension implementation details

## Key Entry Points
- `services/madoc-ts/src/frontend/site/`
- `services/madoc-ts/src/frontend/site/routes.tsx`
- `services/madoc-ts/src/frontend/site/server.ts`
- `services/madoc-ts/src/routes/site/`

## Quick Start Workflow
1. Start with `services/madoc-ts/src/frontend/site/routes.tsx` to locate the route tree.
2. Inspect `services/madoc-ts/src/frontend/site/server.ts` for SSR wiring and loader integration.
3. Follow page components and loaders for the route you are modifying.

## Common Tasks
- Add or modify a site page
- Update site route data loading
- Adjust site layout or navigation

## Pitfalls
- Adding a route without its loader or data fetch
- Breaking SSR hydration by mismatching route data
- Reusing admin-only components on site routes

## Suggested Checks
- Site page SSR request
- Site route client-side navigation
