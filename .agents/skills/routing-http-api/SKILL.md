---
name: routing-http-api
description: Trace, add, or refactor HTTP routes in services/madoc-ts. Use when working on request handlers, route registration, route grouping, or route-level middleware and permissions.
---

# Routing & HTTP API (Madoc TS)

## Overview
Map the routing layout, understand handler conventions, and safely add or modify HTTP endpoints.

## Quick Start Workflow
1. Start at `services/madoc-ts/src/routes/root.ts` to see how route trees are composed.
2. Identify the route domain folder under `services/madoc-ts/src/routes/**` (e.g., `site`, `admin`, `iiif`, `search`).
3. Inspect the domain index/entry module to understand how handlers are exported and mounted.
4. Check for required middleware or permission checks in `services/madoc-ts/src/middleware/**` and existing handlers.
5. Follow the handler to any repository or extension dependencies to understand data access.

## Route Map (Entry Points)
- Core routing: `services/madoc-ts/src/routes/root.ts`, `services/madoc-ts/src/router.ts`
- Domain groupings:
  - `services/madoc-ts/src/routes/site/**`
  - `services/madoc-ts/src/routes/admin/**`
  - `services/madoc-ts/src/routes/global/**`
  - `services/madoc-ts/src/routes/iiif/**`
  - `services/madoc-ts/src/routes/iiif-import/**`
  - `services/madoc-ts/src/routes/search/**`
  - `services/madoc-ts/src/routes/media/**`
  - `services/madoc-ts/src/routes/assets/**`
  - `services/madoc-ts/src/routes/manage-site/**`

## Common Tasks
- Add a new endpoint in an existing domain
- Refactor a handler and update its route wiring
- Apply or adjust auth/permission guards on a route
- Locate a handler for a given URL path

## Workflow Guidance
- Match the route domain to its folder under `src/routes` before touching the handler.
- Keep route registration consistent with existing patterns in the domain index.
- Apply middleware in the same order used by neighboring handlers.
- Prefer reusing shared middleware rather than inlining auth checks.

## Useful Local Searches
- `rg -n "routes" services/madoc-ts/src/routes/root.ts`
- `rg -n "router" services/madoc-ts/src/router.ts`
- `rg -n "export.*router|export.*routes" services/madoc-ts/src/routes`
- `rg -n "require.*scope|auth" services/madoc-ts/src/routes services/madoc-ts/src/middleware`

## Pitfalls
- Registering routes in the wrong domain module
- Skipping required permission middleware
- Diverging from the domain’s export/registration pattern

## Suggested Checks
- Exercise the route with a basic request smoke test
- Validate auth/permissions on protected endpoints

## Tooling
- `scripts/route_map.py`: list TypedRouter routes (method + path + file).
  - Usage: `python scripts/route_map.py`
