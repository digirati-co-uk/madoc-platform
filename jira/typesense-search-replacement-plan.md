# Typesense search replacement plan

## Summary
Replace the custom search service with Typesense, preserving the current search API contract and metadata customization while making indexing much faster using JSONL imports. Add multiple indexes: one per site and one per project, with a rollout that allows dual-write and safe cutover.

## Goals
- Faster indexing by bulk-loading JSONL into Typesense.
- Multiple indexes: per site and per project (project search should not scan the site index).
- Preserve existing search behavior:
  - metadata indexing and facet customization (MetadataFacetEditor)
  - hit snippets, bounding boxes, and resource grouping
  - existing SearchQuery/SearchResponse API shape
- Zero/low downtime reindex with alias swap.

## Non-goals
- Redesigning the search UI.
- Changing the IIIF search route that currently queries published capture model fields.

## Current integration points (Madoc TS)
- Search query proxy: `services/madoc-ts/src/routes/site/site-search.ts`
- Indexing entrypoints: `services/madoc-ts/src/routes/search/index-manifest.ts`, `services/madoc-ts/src/routes/search/index-canvas.ts`
- Task orchestration: `services/madoc-ts/src/gateway/tasks/search-index-task.ts`
- Search API client: `services/madoc-ts/src/gateway/api.ts` (`/api/search/*`)
- Facet configuration: `services/madoc-ts/src/routes/search/facet-configuration.ts`
- Gateway routing: `services/gateway/conf.d/services/search-api.conf`
- Docker service: `docker-compose.yml` (search service image)

## Proposed architecture

### 1) Typesense deployment
- Add a Typesense service to `docker-compose.yml` with persistence volume and API key.
- Replace the `search` service container with Typesense and update `services/gateway/conf.d/services/search-api.conf` to point `/api/search` to a new Typesense-backed adapter (see below) or directly to `madoc-ts` if we fold the API into it.

### 2) Search adapter (recommended)
- Implement a Typesense-backed adapter inside `services/madoc-ts` that serves the existing `/api/search/*` contract.
- Keep `ApiClient` calls unchanged so the frontend does not need to change.
- Add a `typesense` client wrapper (new module) with connection config from env (host, port, protocol, API key).

### 3) Index topology (multiple indexes)
- Create separate collections per site and per project:
  - Site collection alias: `madoc_site_<siteId>`
  - Project collection alias: `madoc_project_<projectId>`
- Use timestamped physical collections (e.g., `madoc_site_<siteId>_<yyyymmddhhmm>`) and update aliases on reindex.
- Index each manifest/canvas into:
  - the site collection for its site
  - each project collection it belongs to
- Use collection/manifest/canvas filtering inside a collection via context fields instead of creating per-manifest indexes.

### 4) Schema + document shapes
Two viable approaches; pick after a spike:

**Option A (recommended): one document per “indexable hit”**
- Each document represents a metadata field occurrence (or capture-model field) and includes denormalized resource data.
- Pros: preserves multiple hits/snippets per resource and bounding boxes.
- Cons: more documents, needs grouping at query time.

Suggested fields (string unless noted):
- `id` (unique per indexable)
- `resource_id`, `resource_type`, `resource_label`, `resource_thumbnail`
- `contexts` (string[])
- `metadata_key` (facet), `metadata_value` (facet, string or string[])
- `search_text` (string, indexed)
- `language`, `selector` (object/JSON as string if needed)
- `sort_label` (string, optional)

**Option B: one document per resource**
- Aggregate searchable text into `search_text` and store metadata fields as separate facet fields (e.g., `metadata_title`).
- Pros: fewer documents, simpler grouping.
- Cons: per-field snippets and bounding boxes are harder.

### 5) Indexing pipeline (JSONL)
- Implement a JSONL exporter for manifests/canvases + capture model indexables.
- Use the Typesense import endpoint with `action=upsert` to stream large batches.
- Keep the existing `search-index-task` orchestration; swap the per-resource ingestion to produce JSONL and import in batches.
- For full reindex:
  1. Create a new collection with schema.
  2. Stream JSONL for all resources (site or project).
  3. Swap the alias to the new collection.
  4. Delete the old collection when safe.

### 6) Query pipeline (SearchQuery → Typesense)
Translate the existing `SearchQuery` into Typesense search parameters:
- `fulltext` → `q` (use `*` when empty)
- `search_multiple_fields` → `query_by` across `search_text`, `resource_label`, etc.
- `contexts`/`contexts_all` → `filter_by` on `contexts` (AND for `contexts_all`)
- `iiif_type`/`raw.type__iexact` → `filter_by` on `resource_type`
- `facet_fields` → `facet_by`
- `facets` (metadata filters) → `filter_by` against `metadata_*` fields
- `madoc_id` → `filter_by` `resource_id` or direct lookup

Map Typesense search response to the existing `SearchResponse` shape:
- Group hits by `resource_id` (Typesense `group_by` or post-process).
- Convert highlights into `SearchHit.snippet`.
- Preserve `bounding_boxes` from stored selectors.
- Build `facets.metadata.<key>` from Typesense facet counts.

### 7) Metadata customization and facet config
- Continue using `search-facets` configuration to decide which metadata fields are faceted.
- On config change, either:
  - update schema (add facet fields) and trigger a reindex, or
  - use a permissive schema with a regex field like `metadata_*` (if supported) and set `facet_by` dynamically.
- Preserve config behavior for merged facets and explicit value lists.

### 8) Deletion and consistency
- Implement delete-by-resource-id for manifest/canvas/collection deletes.
- Ensure recursive indexing still works (manifest → canvas tasks).
- Add guardrails so indexing is skipped when `disableSearchIndexing` is true.

## Work breakdown

### Phase 0: Discovery + contracts
1. Document current `/api/search` payloads and responses (sample requests/responses).
2. Inventory search config options used by the UI (`searchStrategy`, `searchMultipleFields`, facet config).
3. Define the minimum fields required to preserve snippets, hits, and facets.

### Phase 1: Infrastructure
1. Add Typesense container and env config.
2. Add a Typesense client wrapper in `services/madoc-ts`.
3. Define collection naming/alias conventions.

### Phase 2: Schema + ingestion
1. Decide between Option A vs B (spike with one site’s data).
2. Implement schema creation for site and project collections.
3. Build JSONL exporter and import pipeline with batching.
4. Wire `search-index-task` to Typesense ingestion (manifest/canvas, recursive).

### Phase 3: Query adapter + response mapping
1. Implement SearchQuery → Typesense request translation.
2. Implement SearchResponse mapping, including facets and highlights.
3. Update `/api/search/search` endpoint to use Typesense.

### Phase 4: Dual-write + parity checks
1. Optional: write to both old search and Typesense while comparing responses.
2. Build a parity check job (sample queries) to validate:
   - result counts
   - top N ordering
   - facet counts
   - snippet presence

### Phase 5: Cutover + cleanup
1. Switch gateway `/api/search` routing to Typesense-backed adapter.
2. Remove old search service image and related config.
3. Update docs and runbook for reindex tasks.

## Testing and validation
- Unit tests for query translation and response mapping.
- Integration tests that index a small manifest/canvas set and query via `/api/search/search`.
- Load test a full reindex with JSONL import and measure throughput.

## Risks / open questions
- Best schema shape for metadata keys with dynamic/merged facets.
- Whether grouping should rely on Typesense `group_by` or custom aggregation.
- Index size growth under Option A (indexable-per-field).
- How to handle search strategy values (`websearch`, `phrase`, `raw`) with Typesense semantics.
- How to expose or log per-line JSONL import errors for admin visibility.

## References
- Typesense docs for search parameters, faceting, and filter syntax
- Typesense docs for JSONL document import and collection aliases
