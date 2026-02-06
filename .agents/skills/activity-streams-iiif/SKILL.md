---
name: activity-streams-iiif
description: Work on Madoc TS activity stream endpoints and IIIF collection/manifest routing. Use when changing activity stream routes or IIIF data responses in services/madoc-ts.
---

# Activity Streams & IIIF (Madoc TS)

## Overview
Describe how activity streams are exposed and how IIIF collection/manifest endpoints are served.

## Key Entry Points
- Activity stream router: `services/madoc-ts/src/activity-streams/router.ts`
- Activity stream routes: `services/madoc-ts/src/activity-streams/routes/**`
- IIIF routes: `services/madoc-ts/src/routes/iiif/**`

## Activity Stream Summary (Based on Source)
- Routes expose OrderedCollection and OrderedCollectionPage endpoints for activity streams.
- Both internal (`/api/madoc/activity/...`) and site-scoped (`/s/:slug/madoc/api/activity/...`) endpoints exist.
- Pagination uses `ACTIVITY_PER_PAGE` and zero-based page indexing.
- `getActivityStreamPage` builds `orderedItems` and links to `prev`/`next` pages.

## IIIF Summary (Based on Source)
- IIIF collections and manifests are resolved via query helpers in `src/database/queries/**`.
- `get-collection.ts` and `get-manifest.ts` build paginated responses with item lists and total counts.
- `optionalUserWithScope` is used to allow site-view access while honoring admin access for unpublished items.

## Quick Start Workflow
1. For activity streams, start in `activity-streams/router.ts` and follow the corresponding route handler.
2. For IIIF manifests or collections, inspect the route under `routes/iiif/**`.
3. Trace the query helper used to assemble the response.

## Common Tasks
- Add a new activity stream endpoint or parameter
- Adjust paging rules or page size
- Update IIIF manifest/collection response shape

## Pitfalls
- Incorrect page indexing (zero-based vs one-based)
- Missing site id lookup for site-scoped endpoints
- Returning unpublished items to non-admin users

## Suggested Checks
- Fetch a stream `changes` endpoint and its `page/0`
- Fetch a manifest or collection and validate pagination fields
