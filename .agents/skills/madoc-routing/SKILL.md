---
name: madoc-routing
description: Madoc HTTP endpoint registration, body validation, and public IIIF/activity response contracts. Applies to route wiring or request/response boundary changes; handler-internal domain logic alone does not need this skill.
---

# Madoc Routing

## Route boundaries

Start at the named entry in `src/router.ts` and its handler in `src/routes/`. Specialized tables live in `src/activity-streams/router.ts` and `src/capture-model-server/router.ts`. Follow the complete endpoint wiring checklist in `AGENTS.md`.

- `src/utility/typed-router.ts` owns method-specific middleware. `isPublic` bypasses automatic auth/site-state only for GET; it does not make POST/PUT/PATCH public.
- `src/middleware/request-body.ts` copies the body and validates it only when both body and `schemaName` exist. A TypeScript request type alone provides no runtime validation; handle missing required bodies explicitly.
- Keep site/admin/global route placement and scope checks aligned. Preserve denied-scope `NotFound` responses and dispose scoped APIs as described in `AGENTS.md`.

## IIIF and activity streams

IIIF handlers live in `src/routes/iiif/` and `src/routes/iiif-import/`; activity handlers live in `src/activity-streams/routes/`. Public responses still need unpublished-resource access checks. Activity pagination uses `ACTIVITY_PER_PAGE`; preserve the handler's current page-number and link semantics.

## Verify

Exercise the endpoint with allowed and denied identities, and missing/invalid bodies when relevant. For IIIF/activity changes, check response shape and first/previous/next links, including an empty result.
