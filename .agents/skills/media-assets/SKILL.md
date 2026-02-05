---
name: media-assets
description: Work on Madoc TS media upload, storage, and thumbnail generation. Use when editing media APIs, media extension flows, or storage-backed asset handling in services/madoc-ts.
---

# Media & Assets (Madoc TS)

## Overview
Explain how media records are created, files are uploaded to storage, and thumbnails are generated and stored.

## Key Entry Points
- Media routes: `services/madoc-ts/src/routes/media/**`
- Media extension: `services/madoc-ts/src/extensions/media/extension.ts`
- Media repository: `services/madoc-ts/src/repository/media-repository.ts`
- Storage API routes: `services/madoc-ts/src/routes/assets/**` and storage API endpoints under `/api/storage/*`

## Flow Summary (Based on Source)
- `MediaExtension.createMedia`:
  - Validates file type and size (PNG/JPEG, <= 5 MB).
  - Creates a media record with metadata (width/height, filenames).
  - Uploads the file to storage: `/api/storage/data/media/public/:id/:fileName`.
  - Triggers thumbnail generation (e.g., 256/512 sizes).
- `generate-thumbnails` route:
  - Fetches original media from storage via `siteApi.getStorageRaw`.
  - Uses `sharp` to resize and uploads thumbnails back to storage.
  - Updates the DB record with a `thumbnails` map.

## Quick Start Workflow
1. Locate the media route or extension you're modifying.
2. For media creation flows, verify validation rules and upload path.
3. For thumbnails, confirm the resizing and storage upload path is correct.
4. Update the media record metadata and thumbnails map when processing succeeds.

## Common Tasks
- Add a new thumbnail size or generation rule
- Adjust media validation rules
- Update storage path conventions
- Fix thumbnail upload errors

## Pitfalls
- Storing thumbnails without updating the DB thumbnail map
- Incorrect storage paths (media id/file name mismatch)
- Generating thumbnails for unsupported formats

## Suggested Checks
- Upload an image and confirm DB record + storage file
- Request `generate-thumbnails` and confirm storage + DB updates
