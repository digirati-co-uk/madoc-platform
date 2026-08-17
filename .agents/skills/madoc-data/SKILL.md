---
name: madoc-data
description: Work on Madoc TS database migrations, Slonik queries, repository methods, row mapping, shared TypeScript contracts, request schemas, and generated schema artifacts. Use when a change crosses persistence or data contracts in services/madoc-ts.
---

# Madoc Data

## Source map

- Forward-only SQL migrations: `services/madoc-ts/migrations/`
- Migration runners: `src/migrate.ts`, `migrate.cjs`
- Shared queries: `src/database/queries/`
- SQL composition helpers: `src/utility/postgres-tags.ts`
- Repositories and row mapping: `src/repository/`
- Domain types: `src/types/`
- TypeScript schema/config shapes: `src/types/schemas/`
- Runtime request schemas and generated artifacts: `services/madoc-ts/schemas/`

## Workflow

1. Start at the owning repository or caller and look for an existing query/helper.
2. If storage changes, add a new migration; never edit an applied migration.
3. Update the query and row mapping together.
4. Update shared types, request schemas, API methods, and consumers when the contract changes.
5. Regenerate schema outputs using the repository's existing script when required.

## Guardrails

- Use Slonik's `sql` tag and existing composition helpers; do not interpolate SQL strings.
- Keep DB access in the existing repository/query owner instead of route-local SQL.
- Use explicit row and domain types; do not introduce `any` to bridge a contract change.
- Treat migrations as forward-only production history and make destructive transforms explicit.
- Collection and project membership are embedded in Typesense manifest documents; structure changes must reindex affected manifests.

## Check

Run the narrowest query/repository or schema validation available. For a migration, verify it against a disposable database and confirm the application can read the resulting shape.
