---
name: types-schemas
description: Work on Madoc TS shared type definitions and schema contracts. Use when updating TypeScript types, JSON schema shapes, or cross-layer data contracts in services/madoc-ts.
---

# Types & Schemas (Madoc TS)

## Goal
Document shared type and schema locations so cross-layer data contracts stay consistent.

## Scope
- Type definitions under `src/types`
- JSON schema shapes under `src/types/schemas`
- Shared contracts used across API, frontend, and extensions

## Non-scope
- Implementation logic in routes or repositories
- Migration SQL
- UI components

## Key Entry Points
- `services/madoc-ts/src/types/`
- `services/madoc-ts/src/types/schemas/`
- `services/madoc-ts/src/types/schemas/_pagination.ts`

## Workflow Guidance
- Prefer updating shared schema types in one place and update all importers.
- When adding new schemas, keep naming consistent with existing files.

## Tooling
- `scripts/schema_index.py`: index schema files and usage counts.
  - Usage: `python scripts/schema_index.py`

## Suggested Checks
- Run typecheck if available
- Validate affected API responses against updated types
