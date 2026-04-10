# Typesense installation for Madoc

This guide describes how to add Typesense to a Madoc installation that is managed with Docker Compose.

The current Madoc integration assumes:

- Madoc talks to Typesense from the server side.
- Browser clients do not talk to Typesense directly.
- The same admin API key is shared between the `typesense` container and the `madoc-ts` container.
- Madoc creates and updates its own collections automatically.

## What gets added

Madoc uses Typesense in two places:

- A site search collection for manifests and canvases.
- An indexables collection for flattened capture-model search data.

Collection names are derived from `TYPESENSE_COLLECTION_PREFIX`:

- `${TYPESENSE_COLLECTION_PREFIX}_site_<siteId>`
- `${TYPESENSE_COLLECTION_PREFIX}_indexables_site_<siteId>`

## 1. Generate an API key

Generate a long random key and add it to your Compose environment file:

```bash
openssl rand -hex 32
```

Example `.env` values:

```env
SEARCH_USE_TYPESENSE=true
TYPESENSE_PROTOCOL=http
TYPESENSE_HOST=typesense
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=replace-with-a-long-random-string
TYPESENSE_COLLECTION_PREFIX=madoc
```

Optional:

```env
TYPESENSE_AVAILABILITY_TTL_MS=5000
PORTS_TYPESENSE=8108
```

Notes:

- `SEARCH_USE_TYPESENSE` must be `true` or Madoc will disable the integration.
- `TYPESENSE_API_KEY` is required. Madoc treats the integration as "not configured" when it is missing.
- `TYPESENSE_HOST=typesense` assumes the Compose service is named `typesense`.
- `TYPESENSE_COLLECTION_PREFIX` lets multiple Madoc environments share one Typesense instance without collection-name collisions.
- `TYPESENSE_AVAILABILITY_TTL_MS` only controls how long Madoc caches the health-check result.

## 2. Add Typesense env vars to `madoc-ts`

Add these lines to the `madoc-ts` service `environment` block in `docker-compose.yml`:

```yaml
      - SEARCH_USE_TYPESENSE=${SEARCH_USE_TYPESENSE:-true}
      - TYPESENSE_PROTOCOL=${TYPESENSE_PROTOCOL:-http}
      - TYPESENSE_HOST=${TYPESENSE_HOST:-typesense}
      - TYPESENSE_PORT=${TYPESENSE_PORT:-8108}
      - TYPESENSE_API_KEY=${TYPESENSE_API_KEY:-replace-me}
      - TYPESENSE_COLLECTION_PREFIX=${TYPESENSE_COLLECTION_PREFIX:-madoc}
```

If your Compose file still uses `links`, add:

```yaml
    links:
      - typesense
```

If your Compose setup uses `depends_on` instead of `links`, prefer:

```yaml
    depends_on:
      - typesense
```

Madoc only needs network access to the Typesense HTTP API. It does not need a separate search-only browser key because the frontend uses Madoc proxy routes under `/api/madoc/typesense` and `/s/:slug/madoc/api/typesense`.

## 3. Add the `typesense` service

Add this service to `docker-compose.yml`:

```yaml
  typesense:
    image: typesense/typesense:0.25.2
    command: "--data-dir /data --api-key=${TYPESENSE_API_KEY:-replace-me} --enable-cors"
    ports:
      - "${PORTS_TYPESENSE:-8108}:8108"
    volumes:
      - ./var/typesense:/data
```

Important details:

- The API key in `command` must match `TYPESENSE_API_KEY` in `madoc-ts`.
- `./var/typesense:/data` persists the index between restarts.
- `--enable-cors` is useful for diagnostics and the local dashboard, but Madoc itself uses the server-side proxy rather than direct browser access.

If you already run Typesense elsewhere, you do not need this service. Point Madoc at the existing instance with `TYPESENSE_PROTOCOL`, `TYPESENSE_HOST`, `TYPESENSE_PORT`, and `TYPESENSE_API_KEY`.

## 4. Optional: add the dashboard

For local debugging, you can add the dashboard service used in the development Compose file:

```yaml
  typesense-dashboard:
    image: bfritscher/typesense-dashboard:latest
    restart: on-failure
    ports:
      - "8109:80"
```

This is optional. Madoc does not depend on it.

## 5. Start or rebuild the stack

If you changed env or service definitions, rebuild and restart:

```bash
docker compose up -d --build typesense madoc-ts
```

If you changed Madoc server code as well, rebuild the server bundle and restart the PM2 app:

```bash
source ~/.nvm/nvm.sh
nvm use 22
pnpm --dir services/madoc-ts build:vite-server
docker compose exec madoc-ts pm2 restart server
```

Useful checks:

```bash
docker compose ps
docker compose logs --tail=200 typesense
docker compose logs --tail=200 madoc-ts
docker compose exec madoc-ts pm2 list
```

## 6. Verify that Madoc can see Typesense

Madoc exposes a proxy status route per site:

```text
/s/<site-slug>/madoc/api/typesense/status
```

The response should look like:

```json
{
  "available": true,
  "collection": "madoc_site_1"
}
```

If it returns `available: false`, the `reason` field usually tells you whether Typesense is disabled, not configured, or failing health checks.

There is also an admin UI at:

```text
/enrichment/typesense-playground
```

That page uses the same Madoc proxy routes as the site search UI, so it is a good end-to-end verification tool.

## 7. Backfill existing content

Starting Typesense does not backfill existing manifests automatically. After enabling it on an existing site, run a full reindex from the admin UI:

```text
Site admin -> Search indexing -> Reindex all manifests
```

That creates background `search-index-task` jobs which reindex every manifest and the canvases under those manifests.

You can also trigger the same operation through the Madoc API:

```text
POST /api/madoc/iiif/reindex
```

The queue worker must be running for the background indexing tasks to complete.

## 8. What Madoc indexes

The current Typesense integration indexes:

- Manifests
- Canvases
- Capture-model-derived text flattened into search fields
- Metadata facet values normalized into `metadata_*` fields

The user-facing site search and autocomplete use:

- `resource_label`
- `search_text`

Typesense search routes are proxied through Madoc, not exposed with the raw admin key in browser code.

## 9. Operational notes

- If you disable Typesense with `SEARCH_USE_TYPESENSE=false`, Madoc reports the feature as disabled and the Typesense-specific UI falls back or hides itself where supported.
- If Typesense is enabled but unreachable, Madoc returns a `503` from the proxy status/search routes instead of silently failing.
- Full reindex should be the first recovery tool after enabling Typesense, changing collection prefixes, or correcting bad/stale index data.
