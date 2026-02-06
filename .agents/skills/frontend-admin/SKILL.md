---
name: frontend-admin
description: Work on Madoc TS admin UI structure, React routes, and admin-specific SSR behaviors. Use when adding admin screens, updating management flows, or adjusting admin-only UI in services/madoc-ts.
---

# Frontend Admin (Madoc TS)

## Goal
Describe the admin React app structure and routing so management UI changes follow existing patterns and permissions.

## Scope
- Admin React app structure and routing
- Admin SSR entrypoints and loaders
- Admin navigation and layout

## Non-scope
- Site UI and public routes
- Backend route handlers outside admin pages
- Auth server internals

## Key Entry Points
- `services/madoc-ts/src/frontend/admin/`
- `services/madoc-ts/src/frontend/admin/routes.tsx`
- `services/madoc-ts/src/frontend/admin/server.tsx`
- `services/madoc-ts/src/routes/admin/`

## Quick Start Workflow
1. Start with `services/madoc-ts/src/frontend/admin/routes.tsx` to locate the route tree.
2. Inspect `services/madoc-ts/src/frontend/admin/server.tsx` for SSR wiring and loader integration.
3. Follow the route component and any loader/data fetch tied to the admin view.

## Common Tasks
- Add or modify an admin screen
- Update admin route data loading
- Adjust admin navigation or layout

## Pitfalls
- Missing permission checks for admin-only pages
- Route loader mismatches causing SSR hydration errors
- Mixing site and admin components

## Suggested Checks
- Admin page SSR request
- Admin route navigation and access control
