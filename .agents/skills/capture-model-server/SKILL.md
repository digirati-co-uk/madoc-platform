---
name: capture-model-server
description: Work on Madoc TS capture model server APIs, repositories, and migration helpers. Use when modifying capture model routes, repository queries, or model migration flows in services/madoc-ts.
---

# Capture Model Server (Madoc TS)

## Goal
Explain capture model server routes and repository logic so model CRUD and migration updates stay consistent.

## Scope
- Capture model server routes and router table
- Capture model repository queries and helpers
- Server-side model filters and migrations

## Non-scope
- Frontend capture model editor UI
- Extension registration outside capture model server
- Unrelated route handlers

## Key Entry Points
- `services/madoc-ts/src/capture-model-server/router.ts`
- `services/madoc-ts/src/capture-model-server/capture-model-repository.ts`
- `services/madoc-ts/src/capture-model-server/routes/`
- `services/madoc-ts/src/capture-model-server/migration/`
- `services/madoc-ts/src/capture-model-server/server-filters/`

## Architecture Summary (Based on Source)
- `router.ts` maps capture model API endpoints under `/api/madoc/crowdsourcing/*`.
- `CaptureModelRepository` contains the core Slonik queries for models, documents, structures, and revisions.
- Server filters shape model payloads and migration helpers support legacy API transitions.

## Quick Start Workflow
1. Review `services/madoc-ts/src/capture-model-server/router.ts` to locate the endpoint you are changing.
2. Inspect the relevant route handler in `services/madoc-ts/src/capture-model-server/routes/`.
3. Update repository queries in `capture-model-repository.ts` if data shape changes.

## Common Tasks
- Add a new capture model route
- Adjust model/revision query shapes
- Update model migration behavior

## Pitfalls
- Returning inconsistent model shapes between routes
- Skipping repository helpers when a shared query exists
- Changing migration paths without updating router mappings

## Suggested Checks
- Fetch a capture model and revision list
- Run a model migration endpoint in dev
