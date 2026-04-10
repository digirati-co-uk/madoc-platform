---
name: utility-core
description: Work on Madoc TS shared utility helpers (JWT, metadata, errors, IIIF helpers, auth helpers). Use when changing core utility functions or shared helpers in services/madoc-ts.
---

# Utility Core (Madoc TS)

## Goal
Document the shared utility layer so changes to common helpers are made safely and consistently.

## Scope
- JWT helpers (parse/verify/sign)
- IIIF helpers and metadata mapping
- Error classes and request helpers
- Slonik helper utilities

## Non-scope
- Feature-specific business logic
- Frontend rendering code
- Migration SQL

## Key Entry Points
- `services/madoc-ts/src/utility/`
- `services/madoc-ts/src/utility/errors/`
- `services/madoc-ts/src/utility/postgres-tags.ts`
- `services/madoc-ts/src/utility/iiif-database-helpers.ts`
- `services/madoc-ts/src/utility/verify-signed-token.ts`
- `services/madoc-ts/src/utility/parse-jwt.ts`

## Workflow Guidance
- Prefer reusing existing helpers (JWT, metadata, URN parsing) before introducing new ones.
- Keep helpers deterministic and side-effect free when possible.

## Suggested Checks
- Run a targeted unit/integration flow that exercises updated helper behavior
- Confirm any shared helpers remain compatible with both server and browser contexts
