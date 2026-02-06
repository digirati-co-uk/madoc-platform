# Typesense-first search redesign plan

## Why change the plan?
- Usage is low, so we can simplify instead of mimicking every legacy behavior.
- Lean into Typesense strengths: typo tolerance, fast ranked search, built-in grouping/facets, multi-search, and JSONL imports.
- Accept UI/feature adjustments to reduce complexity and maintenance.

## Guiding principles
- Optimize for relevance + speed, not strict parity with the old service.
- Prefer one clear UX for users; drop obscure toggles and legacy search strategies.
- Keep operational simplicity: few collections, predictable schemas, alias-based cutovers.

## Target experience (user-facing)
- One search box with instant results (server-driven, debounce on input).
- Facets shown when available; hide empty facets by default.
- Snippets from highlighted text; bounding boxes optional and can return later if needed.
- Result cards grouped by resource (collection/manifest/canvas) with per-resource hits folded into a collapsible detail.
- Optional “search within this project/site” switch instead of per-index route changes.

## Architecture choices
- **API home**: all `/api/search/*` endpoints live inside the `madoc-ts` service (no standalone search container). Gateway proxies `/api/search` directly to `madoc-ts`.
- **Collections**: keep per-site collections, optional per-project collections when projects want isolated relevance. Use aliases `site_<siteId>` and `project_<projectId>` pointing to timestamped physical collections.
- **Schema shape (new default)**: one document per resource (collection/manifest/canvas). Use `document_groups` + `group_by` to cluster hits by resource. Store per-field text as arrays for highlighting and facetting.
- **Fields (core)**
  - `id` (resource-scoped)
  - `resource_id`, `resource_type`, `resource_label`, `thumbnail`
  - `site_id`, `project_ids` (string[])
  - `search_text` (string[]; concatenated metadata + label + capture model values)
  - `metadata_keys` (string[] facet), `metadata_pairs` (string[] facet like `key:value`), `languages` (string[] facet)
  - `year_ranges` or `date_range_start/end` (ints) for date filters
  - `sort_label` (string) for alpha sorts
- **Highlights**: use `highlight_full_fields` on `search_text` and `resource_label`.
- **Typo tolerance**: Typesense default (2 typos) with per-field overrides for short fields.
- **Synonyms/stop-words**: configure per-site lists stored in DB and pushed to Typesense on change.
- **Vector search (optional later)**: reserve `vector` field; add when embeddings are available.

## Indexing pipeline
- Export JSONL per site/project using existing search-index tasks; switch ingestion to Typesense `import` with `action=upsert`.
- Batch size: 5k docs; parallel streams per collection.
- On reindex: create new physical collection, import, swap alias, delete old collection.
- Deletes: delete by `id` when resources are removed; cascade canvas deletes via project/site collections.
- Config changes (facets/synonyms/stop-words): update schema or settings then trigger partial reindex if needed.

## Query pipeline
- `/api/search/search` in `madoc-ts` becomes a thin adapter over Typesense (no external search API service).
- Map UI filters to Typesense:
  - free text → `q`; empty → `*`
  - facets → `filter_by` using `metadata_pairs:` or `metadata_keys:`
  - type filters → `resource_type:`
  - project/scope toggle → choose collection alias (`project_<id>` else `site_<id>`)
  - date sliders → `date_range_start<=` / `date_range_end>=`
  - group results by `resource_id` using Typesense `group_by`.
- Sort options: relevance (default), alpha via `sort_label`, newest via `date_range_start` desc.

## UI adjustments to match Typesense
- Remove legacy search strategy toggles (`websearch`, `phrase`, `raw`).
- Replace per-field snippet UI with single highlight snippet per result; add “show more matches” that reveals secondary highlights (from group hits).
- Facets auto-collapse when empty; apply debounce to avoid flicker.
- Show typo-correction hint (“Showing results for …”).
- Add “No results? Try removing filters” helper with a one-click clear.

## Operational plan
1) Add Typesense service (docker) + env wiring; remove old search container after cutover.
2) Implement Typesense client wrapper and adapter routes in `services/madoc-ts`; ensure `/api/search/*` is registered only in `madoc-ts`.
3) Build new schema + JSONL exporter (resource-per-doc).
4) Implement `/api/search/search` translation + response mapping (grouped results, facets, highlights, typo info).
5) Smoke-test with one site; measure:
   - p50/p95 search latency
   - indexing throughput (docs/sec)
   - result quality (manual spot-check)
6) Enable dual-write: continue old index briefly for backstop; run parity smoke tests on top N queries.
7) Cutover gateway so `/api/search` upstream points to `madoc-ts` (Typesense-backed); delete old search service; document reindex runbook.

## Testing
- Unit: query translation, filter mapping, facet response mapping, highlight extraction.
- Integration: index small fixture set; verify grouping, facets, typo tolerance, synonym effect.
- Load: reindex a medium site to validate JSONL throughput and memory profile.

## Risks / mitigations
- Loss of per-field snippets/bounding boxes: accepted; can reintroduce later using Option A (indexable-per-field) if demand appears.
- Schema drift when metadata keys change: rely on permissive `metadata_pairs` string facets to avoid schema churn; reindex if adding numeric/date facets.
- Large project indexes: mitigate with per-project collections only when needed; otherwise rely on site collection + project filter.

## Stretch (post-MVP)
- Add vector + hybrid search when embeddings are available.
- Add pin/promote rules for curated results.
- Add search analytics dashboard (queries, zero-results, latency) to guide relevance tuning.

## Capture model indexing (research + proposal)
- **Storage shape** (Postgres):
  - `capture_model_document` holds the full document tree in `document_data` (JSONB) and `search_strings` text (currently always empty). `target` is JSONB array of `{id,type}` URNs; indexed via ad-hoc jsonb path queries.
  - `capture_model` links document + structure, stores `target`/`integrity`; one row per model and site.
  - `capture_model_revision` stores per-field revisions in `revision_data` JSON; fields track `revises`/`approved`.
  - Existing helper `captureModelToIndexables` flattens a published model (after revision resolution) into per-field indexables with selector → box conversion and drops fields whose `revises` was superseded.
- **Document structure**:
  - Root entity `{ id, type:'entity', properties: {key: [fields|entities]} }` with arbitrary nesting.
  - Fields carry `value`, `selector` (box/polygon), optional `revision/revises/sortOrder`, and parent entity key is the semantic type.
  - Paragraph models are a special case; current indexing pulls them out separately before flattening.
- **Bottlenecks today**:
  - Reindex pipeline fetches models per-canvas via API calls, then traverses JSON in Node; `search_strings` column is unused.
  - No batching/streaming; revision resolution happens in app code, not in SQL.
- **Faster indexing approach**:
  1) **Batch-fetch models by target in SQL**: use repository-level query with `jsonb_path_query_first(cm.target::jsonb, '$[*] ? (@.id == $target)')` to filter by resource URN and stream rows with a cursor; avoid per-model API calls.
  2) **Pre-flatten to JSONL**: implement `flattenCaptureModelDocument(document, {includeSelectors:true, dropRevised:true})` (reuse `traverseDocument`) to emit rows `{resource_id, model_id, field_id, field_path, field_type, parent_entity, value, selector, language}`. Keep paragraph extraction as a pre-pass.
  3) **Typesense collection choice**:
     - Preferred: dedicated `capture_fields` collection per site; `group_by=resource_id` for result cards; facets on `field_type`, `parent_entity`, `project_ids`, `language`; highlights on `value`.
     - Alternative: embed flattened fields into the main resource document as `fields[]` and push their values into `search_text`; store selectors in parallel array for UI overlays.
  4) **Reuse search_strings**: populate `search_strings` on write/update (currently stubbed) with a cheap traversal of leaf text; during reindex stream `search_strings` for quick fall-back text if full flatten fails.
  5) **Revision handling**: when loading models, request `published=true` so the server filter applies approved revisions; additionally drop any field where `revises` is present to avoid duplicates (as in `captureModelToIndexables`).
  6) **Throughput knobs**: cursor batch size 500 docs; JSONL import to Typesense with `action=upsert`, chunked at ~5k flattened fields per batch; parallelize per-site collection imports.
- **Why this is faster**:
  - Eliminates per-canvas API round-trips; uses single SQL scan per site/project.
  - Avoids repeated deep traversal by caching `search_strings` and streaming flattened rows directly to JSONL.
  - Keeps selectors/path metadata so UI can still show highlight/bounding boxes later if needed.

## IIIF resource + metadata indexing (research + proposal)
- **Storage shape**:
  - `iiif_resource`: core dims (`type`, `source` unique, `rights`, `viewing_direction`, `nav_date`, `height/width/duration`, `default_thumbnail`, `placeholder_image`).
  - `iiif_derived_resource`: site binding for every resource (`resource_id`, `resource_type`, `site_id`, `slug`, `task_complete`, `flat`), unique on `(resource_id, site_id)`.
  - `iiif_derived_resource_items`: ordered children (e.g., manifest → canvases) with `(resource_id, item_id, item_index, site_id)`, indexed for preview (item_index < 5).
  - `iiif_metadata`: per-field rows `(key, value, language, source, resource_id, site_id, readonly, edited, auto_update, data)`; uniqueness on `(key, COALESCE(value,''), language, source, resource_id, COALESCE(site_id,-1))`; index on `(resource_id, site_id)` and partial index on labels.
  - FKs cascade deletes, so removing a manifest deletes its canvases’ metadata via derived-resource items + resource cascade.
- **Current query pattern**:
  - Manifest snippets (`get-manifest-snippets.ts`) join `iiif_metadata` for both manifest and canvas ids, filtered per site. Listing/range paging currently executes per-canvas joins in app space when reindexing.
- **Performance goal (manifest-at-a-time)**:
  - One SQL round-trip per manifest (or small batch) that returns manifest row, ordered canvases, and all metadata for both levels.
  - Stream directly to JSONL for Typesense; avoid per-canvas API/DB loops in Node.
- **SQL export outline (per manifest)**:
  - `manifest` CTE: select manifest resource + derived row by `site_id`/`resource_type='manifest'`.
  - `members` CTE: ordered canvases `item_id, item_index` from `iiif_derived_resource_items` for that manifest/site.
  - `metadata` CTE: `jsonb_agg` grouped by `resource_id` over all ids in `manifest ∪ members`.
  - Final select builds:
    - `manifest_doc`: manifest fields + `metadata` array (default `[]`) + `project_ids` from `iiif_project` where `collection_id = manifest.id`.
    - `canvas_docs`: `jsonb_agg` of canvases with `item_index`, core fields from `iiif_resource`, and their metadata.
  - Preserve canvas order with `order by item_index` inside `jsonb_agg`.
- **Indexing strategy**:
  - Emit JSONL lines: one manifest doc + one line per canvas from the same query result; import with Typesense `action=upsert`.
  - Doc fields:
    - `resource_id`, `resource_type`, `resource_label` (from metadata key `label`), `thumbnail` (default/placeholder), `rights`, `nav_date`.
    - `contexts`: site, project(s), collection/manifest/canvas chain.
    - `metadata_pairs` (`key:value`), `metadata_keys`, `languages` (from `language`), `search_text` (concat metadata + label + summary if present).
    - `sort_label` from label; `item_index` for canvases to stabilize ranking within manifests.
  - Optionally add `project_ids` and `site_id` facets for scoping without extra filters.
- **Batching/throughput**:
  - Cursor over `iiif_derived_resource` where `resource_type='manifest' and site_id=$site`; batch size ~50 manifests.
  - Each batch produces `(1 + canvas_count)` docs per manifest; still single SQL per manifest, no N+1.
  - Network: one response per batch; CPU: SQL-side aggregation instead of JS loops.
- **Deletion/consistency**:
  - On manifest delete, issue Typesense delete for manifest + its canvases using ids from `members`. DB cascades already clean metadata.
- **Why this is faster**:
  - Eliminates per-canvas DB/API fetches during reindex.
  - Uses set-based JSON aggregation in Postgres, minimizing Node processing.
  - Preserves ordering and site scoping in the export, so search imports stay deterministic and safe across sites.
