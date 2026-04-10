---
name: db-queries
description: Work on Madoc TS SQL query modules and shared query helpers. Use when adding or modifying queries in services/madoc-ts/src/database/queries or related SQL helper usage.
---

# Database Queries (Madoc TS)

## Goal
Document the query module structure so SQL changes follow existing patterns and helper usage.

## Scope
- Query modules in `src/database/queries`
- Slonik SQL tag usage and helper tags
- Query composition conventions

## Non-scope
- Repository layer behavior
- Migration scripts
- Route handlers

## Key Entry Points
- `services/madoc-ts/src/database/queries/`
- `services/madoc-ts/src/utility/postgres-tags.ts`
- `services/madoc-ts/src/database/create-postgres-pool.ts`

## Architecture Summary (Based on Source)
- Query modules export Slonik `sql` template strings with typed results.
- Conditional SQL composition uses helper tags like `SQL_EMPTY`, `SQL_COMMA`, and typed array helpers.
- Queries are imported into repositories or handlers for execution via Slonik connections.

## Quick Start Workflow
1. Review the relevant query file in `services/madoc-ts/src/database/queries/`.
2. Use the `sql` tag and helper tags from `services/madoc-ts/src/utility/postgres-tags.ts` for composition.
3. Update any repository or handler that consumes the query.

## Common Tasks
- Add a new query module
- Extend a query with optional filters
- Adjust query return shapes and typings

## Pitfalls
- Building SQL strings without helper tags, risking invalid SQL
- Mismatching expected row types in callers
- Returning different column names without updating mappers

## Suggested Checks
- Run the query against a dev database
- Verify downstream mapping code still aligns with the query
