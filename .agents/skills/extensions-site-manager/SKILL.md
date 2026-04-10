---
name: extensions-site-manager
description: Work on Madoc TS site manager extension APIs for sites, users, invitations, terms, and badges. Use when changing site management flows or site manager API calls in services/madoc-ts.
---

# Site Manager Extension (Madoc TS)

## Goal
Document the site manager extension API surface so changes to site/user management stay consistent.

## Scope
- Site manager API calls for sites, users, invitations
- Terms and badge management endpoints
- Query and pagination behavior

## Non-scope
- Site manager route handlers implementation
- Frontend UI components for management pages
- Auth server behavior

## Key Entry Points
- `services/madoc-ts/src/extensions/site-manager/extension.ts`
- `services/madoc-ts/src/extensions/site-manager/hooks.ts`
- `services/madoc-ts/src/extensions/site-manager/types.ts`

## Architecture Summary (Based on Source)
- `SiteManagerExtension` exposes typed API calls to `/api/madoc/*` endpoints for site management.
- `hooks.ts` generates React Query hooks for `get*` methods on the extension.
- The extension covers site CRUD, user CRUD, invitations, term configurations, badges, and terms.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/site-manager/extension.ts` to understand available API calls.
2. Inspect `services/madoc-ts/src/extensions/site-manager/types.ts` for request/response shapes.
3. If adding a new `get*` method, confirm `hooks.ts` will expose it.

## Common Tasks
- Add a new site management API call
- Update user or invitation flows
- Extend term or badge management methods

## Pitfalls
- Adding a new `get*` API without considering hooks generation
- Changing request shapes without updating types
- Misaligned querystring formatting for list/search methods

## Suggested Checks
- Fetch site list with query params
- Create/update a user or invitation
- List badges or terms
