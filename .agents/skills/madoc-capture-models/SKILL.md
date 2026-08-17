---
name: madoc-capture-models
description: Work on Madoc TS capture-model APIs, persistence, revisions, migrations, server filters, capture-model extension calls, and editor-facing contracts. Use when changing capture model CRUD, revision behavior, model migration, serialization, or server/frontend data flow in services/madoc-ts.
---

# Madoc Capture Models

## Source map

- API table: `src/capture-model-server/router.ts`
- Handlers: `src/capture-model-server/routes/`
- Persistence: `src/capture-model-server/capture-model-repository.ts`
- Model migrations: `src/capture-model-server/migration/`
- Response transforms: `src/capture-model-server/server-filters/`
- Client/server API facade: `src/extensions/capture-models/`
- Shared model and revision contracts: `src/frontend/shared/capture-models/types/`

## Workflow

1. Locate the endpoint in the capture-model router and follow it through the handler.
2. Trace repository reads/writes plus any server filter before changing a response shape.
3. Find all extension and editor consumers of the affected model/revision field.
4. For legacy-shape changes, use the existing migration layer instead of adding route-local compatibility branches.

## Guardrails

- Keep document, structure, revision, and metadata shapes consistent across routes.
- Reuse repository methods; do not add a second query path in a handler.
- Treat migrations as compatibility code and test both pre- and post-migration shapes.
- Do not assume an enrichment pipeline exists: follow concrete call sites from the capture-model extension.

## Check

Use one representative model to verify the changed CRUD/revision path and any migration or filter involved. Add a focused regression test for non-trivial transforms.
