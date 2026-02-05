---
name: routes-admin
description: Work on Madoc TS admin route handlers, request/response patterns, and admin HTTP endpoints. Use when adding or modifying admin routes in services/madoc-ts.
---

# Admin Routes (Madoc TS)

## Goal
Document admin route conventions so management endpoints follow existing auth and handler patterns.

## Scope
- Admin HTTP route modules
- Admin route handler patterns and middleware
- Admin request/response expectations

## Non-scope
- Site or global routes
- Frontend React route definitions
- Auth server internals

## Key Entry Points
- `services/madoc-ts/src/routes/admin/`
- `services/madoc-ts/src/routes/root.ts`
- `services/madoc-ts/src/routes/global/`

## Quick Start Workflow
1. Review `services/madoc-ts/src/routes/admin/` for existing handler patterns.
2. Confirm shared middleware in `services/madoc-ts/src/routes/root.ts` or `services/madoc-ts/src/routes/global/`.
3. Add or update the admin route module following existing conventions.

## Common Tasks
- Add a new admin endpoint
- Update admin handler responses
- Add route-level middleware for admin routes

## Pitfalls
- Missing authorization checks for admin-only operations
- Inconsistent response shapes across admin endpoints
- Misplacing admin routes under site routes

## Suggested Checks
- Admin route request smoke test
- Admin route auth test
