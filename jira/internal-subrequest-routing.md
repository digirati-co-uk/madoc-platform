# Internal sub-request routing for Madoc TS

## Summary
Madoc TS server-side routes and background tasks often use `ApiClient` to call endpoints that are hosted by the same `madoc-ts` process via `API_GATEWAY`. This forces a network round-trip through the gateway for requests that could be handled in-process. The goal is to add internal routing for these sub-requests so the code can reuse the existing HTTP routing/middleware stack while avoiding unnecessary network hops.

## Affected areas (current)
- Api client + fetcher:
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/api.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/fetch-json.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/api.server.ts`
- App/router bootstrap:
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/app.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/router.ts`
- Representative call sites (server-side):
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-search.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/site/site-user-autocomplete.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/media/generate-thumbnails.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/routes/projects/project-members.ts`
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/capture-model-server/migration/migrate-model-task.ts`

## Problem
- Server handlers call `api.asUser(...).request(...)`, which uses `fetchJson` to hit `API_GATEWAY` even when the endpoint is hosted by the same process.
- This adds latency, extra load, and failure modes (gateway downtime) for purely internal calls.
- Site endpoints and queue/cron tasks often chain multiple internal requests, amplifying the cost.

## Goals
- Provide an internal routing path for sub-requests to endpoints served by `madoc-ts`.
- Preserve existing auth + middleware behavior (JWT parsing, site state, schema validation, error handling).
- Preserve ApiClient response semantics (`allow404`, JSON/text handling).
- Keep a safe fallback to network for non-local endpoints (storage, GitHub, external APIs).
- Add a recursion guard and basic observability.

## Non-goals
- Client-side fetch changes.
- Rewriting handlers to bypass the API client.
- Cross-service routing for endpoints owned by other services.

## Proposed solution

### 1) Internal request runner
- New module (suggested):
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/internal-request.ts`
- Provide a function that executes a Koa route in-process given:
  - method, path, headers, body, and optional parent Koa context.
- Use the existing Koa app/router (`app.callback()` or `app.handleRequest`) with a mock req/res.
- Capture status, headers, and body; parse JSON/text to match `fetchJson` behavior.
- Optionally forward headers/cookies from the parent context and reuse DB connection when safe.

### 2) Internal fetcher wrapper
- New fetcher (suggested):
  - `/Users/stephen/github.com/digirati-co-uk/madoc-platform/services/madoc-ts/src/gateway/internal-fetch-json.ts`
- Signature compatible with `fetchJson`.
- Routing logic:
  - If `MADOC_INTERNAL_SUBREQUESTS` is enabled and the path is local, use the internal runner.
  - Otherwise, fall back to `fetchJson` (network).
- Define a local-route allowlist (prefixes or matcher) for endpoints served by `madoc-ts`, e.g.:
  - `/api/madoc/*`, `/api/search/*`, `/api/tasks/*`, `/api/iiif/*`, `/s/:slug/*`
- Add a recursion guard using a header like `x-madoc-subrequest-depth` with a small max (e.g., 5).

### 3) Bootstrap integration
- Register internal runner in `app.ts` when the Koa app is created.
- Make it accessible to server-side `ApiClient` instances:
  - Option A: update `gateway/api.server.ts` to construct `ApiClient` with the internal fetcher when available.
  - Option B: expose `context.internalApi` or `context.state.internalApi` and update route handlers to use it.
- Use a simple global/module hook or `AsyncLocalStorage` to access the current Koa context for sub-requests.

### 4) Targeted call site updates
- Replace direct uses of the global `api` client in site endpoints with the context-aware client so internal routing is used automatically.
- Prioritize high-traffic routes (search, autocomplete, task metadata) and keep external service calls on network.

### 5) Observability
- Add debug logging indicating `internal` vs `network` for sub-requests.
- Optional counters if log volume is a concern.

## Testing plan
- Unit tests for internal runner:
  - GET/POST JSON responses match `fetchJson` behavior.
  - `allow404` behavior preserved.
  - Recursion guard stops infinite loops.
- Integration tests (or ad-hoc):
  - A site route that uses `ApiClient` should not hit the network when internal routing is enabled.
  - A storage endpoint still goes through network.

## Risks / edge cases
- Koa middleware side-effects (cookie setting, auth refresh) are not propagated to the outer response.
- Double DB connections if internal runner creates a new context without reuse.
- Streaming/binary responses may need explicit handling or stay network-only.

## Acceptance criteria
- Server-side sub-requests to Madoc TS endpoints complete without HTTP network calls when `MADOC_INTERNAL_SUBREQUESTS` is enabled.
- External service calls (storage, GitHub, etc.) continue to use the network.
- Internal responses (status/body) match current network behavior for the same endpoints.
- Recursion guard prevents infinite sub-request loops.
- Clear documentation for allowlist and fallback behavior.
