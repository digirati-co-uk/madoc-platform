---
name: madoc-routing
description: Trace, add, or refactor Madoc TS HTTP routes, TypedRouter registration, request validation, permissions, site/admin/global route groups, activity streams, and IIIF endpoints in services/madoc-ts.
---

# Madoc Routing

## Source map

- Typed route table and names: `src/router.ts`
- Route handlers by domain: `src/routes/`
- Shared middleware: `src/middleware/`
- Activity stream route table and handlers: `src/activity-streams/router.ts`, `src/activity-streams/routes/`
- IIIF handlers: `src/routes/iiif/`, `src/routes/iiif-import/`
- Frontend HTTP bridges: `src/routes/frontend/`

## Add or change a route

1. Find the named entry in `src/router.ts` and read neighbouring routes with the same method and scope.
2. Trace the handler through repositories, extensions, and response mapping before editing.
3. Add/update the runtime request schema and `schemaName` when the body is validated.
4. Add/update the `ApiClient` method when frontend or server consumers need the endpoint.
5. Use the route name and `context.routes.url(...)` for generated links.

## Guardrails

- Respect `TypedRouter`'s method-specific auth/body middleware behavior from `AGENTS.md`.
- Keep permissions explicit and preserve deliberate `NotFound` responses for denied scope.
- Put site, admin, and global handlers in their existing domain; do not add a second router tree.
- Dispose route-created scoped API clients through `context.disposableApis`.
- Treat public IIIF and activity-stream responses as access-controlled data, especially unpublished resources.
- Activity stream pages use `ACTIVITY_PER_PAGE`; read the current handler before changing page-number or link semantics.

## Check

Exercise the named route with allowed and denied identities plus request validation where applicable. For IIIF/activity changes, validate the response shape and first/previous/next pagination links.
