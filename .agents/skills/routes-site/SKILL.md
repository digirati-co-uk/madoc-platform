---
name: routes-site
description: Work on Madoc TS site route handlers, request/response patterns, and site HTTP endpoints. Use when adding or modifying site routes in services/madoc-ts.
---

# Site Routes (Madoc TS)

## Goal
Explain how site routes are organized and implemented so new endpoints follow existing handler conventions.

## Scope
- Site HTTP route modules
- Site route handler patterns and middleware
- Site request/response expectations

## Non-scope
- Admin routes or global routing
- Frontend React route definitions
- Non-site extensions

## Key Entry Points
- `services/madoc-ts/src/routes/site/`
- `services/madoc-ts/src/routes/root.ts`
- `services/madoc-ts/src/routes/global/`

## Quick Start Workflow
1. Review `services/madoc-ts/src/routes/site/` for existing handler patterns.
2. Confirm any shared middleware in `services/madoc-ts/src/routes/root.ts` or `services/madoc-ts/src/routes/global/`.
3. Add or update the site route module following existing conventions.

## Common Tasks
- Add a new site endpoint
- Update a site handler response
- Add middleware for site routes

## Pitfalls
- Missing auth/permission checks where required
- Skipping shared middleware setup
- Returning inconsistent response shapes

## Suggested Checks
- Site route request smoke test
- Route-specific integration test
