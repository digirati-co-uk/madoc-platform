---
name: madoc-data
description: Madoc SQL migrations, repository queries, generated request schemas, and search-index consistency. Applies to storage or validated data-contract changes; local TypeScript types alone do not need this skill.
---

# Madoc Data

## Storage and contracts

- Migrations and runners: `migrations/`, `src/migrate.ts`, `migrate.cjs`
- Query owners and row mapping: `src/database/queries/`, `src/repository/`
- SQL composition: `src/utility/postgres-tags.ts`
- Domain contracts: `src/types/`
- Schema sources: `src/types/schemas/`; generated JSON: `schemas/`

Use Slonik's `sql` tag and the existing query owner. Preserve site predicates on reads and writes, including joins; an object ID alone does not establish tenant access. Keep related writes within the owner's transaction boundary.

For storage changes, add a forward-only migration and update row mapping with its consumers. For generated request schemas, edit the TypeScript source and run `pnpm --dir services/madoc-ts generate-schema` from the repository root; `generate-schemas.js` emits JSON named after exported types. Check the route's `schemaName` matches the generated name and review generated changes before retaining them.

## Search consistency

Collection/project membership is embedded in Typesense manifest documents. Structure changes must reindex affected manifests. Non-flat collections also have documents whose descendant manifest and context data must stay aligned. Start at `src/search/typesense/build-search-documents.ts` and `src/search/typesense/build-manifest-documents.ts`.

## Verify

Use the affected query/repository check, including another site's data when changing scope. Test schema changes with accepted and rejected payloads. Apply migrations to a disposable database and confirm the application reads the resulting shape.
