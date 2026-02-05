---
name: extensions-media
description: Work on Madoc TS media extension upload, metadata, and API flows. Use when changing media ingestion rules, thumbnail generation, or media API calls in services/madoc-ts.
---

# Media Extensions (Madoc TS)

## Goal
Document media extension behavior so media upload, metadata creation, and thumbnail generation remain consistent.

## Scope
- Media extension upload workflow
- Media record creation and API calls
- Thumbnail generation and storage API calls

## Non-scope
- Media route handlers or storage backend implementation
- Frontend UI for media selection
- Non-media extensions

## Key Entry Points
- `services/madoc-ts/src/extensions/media/extension.ts`
- `services/madoc-ts/src/types/media`
- `services/madoc-ts/src/routes/media/`
- `services/madoc-ts/src/routes/assets/`

## Architecture Summary (Based on Source)
- `MediaExtension.createMedia` validates file type/size, reads image dimensions, creates a media record, uploads to storage, then generates thumbnails.
- Media APIs live under `/api/madoc/media` and storage uploads use `/api/storage/data/media/public/{id}/{fileName}`.
- Thumbnail generation is triggered via `/api/madoc/media/{id}/generate-thumbnails`.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/media/extension.ts` to understand validation and upload flow.
2. Confirm expected media types and metadata in `services/madoc-ts/src/types/media`.
3. Check relevant media routes if you need to align API changes.

## Common Tasks
- Adjust accepted media file types or size limits
- Update media metadata fields on creation
- Change thumbnail sizes or generation flow

## Pitfalls
- Breaking upload path or storage bucket assumptions
- Skipping thumbnail generation after upload
- Inconsistent metadata with backend expectations

## Suggested Checks
- Upload a PNG/JPEG and verify stored media
- Generate thumbnails for an uploaded media item
