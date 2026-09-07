---
name: madoc-capture-models
description: Madoc capture-model persistence, revision contracts, response filters, and legacy model migration. Applies to model data flow changes; editor layout and contribution/review policy have separate owners.
---

# Madoc Capture Models

## Trace the model shape

Follow the endpoint in `src/capture-model-server/router.ts` through `routes/`, `capture-model-repository.ts`, and any `server-filters/` under that directory. Then inspect callers in `src/extensions/capture-models/` and shared contracts in `src/frontend/shared/capture-models/types/`.

- Keep document, structure, revision, and metadata relationships consistent across storage and responses. Model and revision IDs do not replace site scoping in repository access.
- When changing read filters, preserve author, accepted/published revision, and debug-scope visibility in `src/capture-model-server/routes/capture-model.ts`.
- Trace concrete extension dispatch calls before assuming how enrichment modifies a response.
- Legacy model migration lives in `src/capture-model-server/migration/`; use that layer for old model shapes. Database schema changes instead use forward-only SQL migrations in `migrations/`.
- Reuse the owning repository methods and inspect their transaction boundaries when a change writes multiple related records.

## Verify

Exercise the affected model/revision operation through its consumer, including any response filter. For migration or transform changes, use representative old and current shapes in a focused regression check.
