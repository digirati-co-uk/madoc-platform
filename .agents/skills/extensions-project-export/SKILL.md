---
name: extensions-project-export
description: Work on Madoc TS project export extension configs, export plan handling, and file output helpers. Use when adding export types or modifying export data flows in services/madoc-ts.
---

# Project Export Extensions (Madoc TS)

## Goal
Explain how export configurations are registered and executed so new export types integrate with existing export plans.

## Scope
- Export config registration via registry
- Export plan types and file output helpers
- Export config metadata and configuration schema

## Non-scope
- Task execution infrastructure outside export helpers
- Project routes unrelated to exports
- Frontend UI for export selection

## Key Entry Points
- `services/madoc-ts/src/extensions/project-export/extension.ts`
- `services/madoc-ts/src/extensions/project-export/types.ts`
- `services/madoc-ts/src/extensions/project-export/export-configs/`
- `services/madoc-ts/src/extensions/project-export/server-export.ts`

## Architecture Summary (Based on Source)
- `ProjectExportExtension` is a `RegistryExtension` with registry name `project-export` and registers default export configs.
- `ExportConfig` defines export data handlers, metadata, and optional configuration models.
- `server-export.ts` provides helper builders for text, json, and csv outputs.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/project-export/types.ts` for export config shape.
2. Inspect `services/madoc-ts/src/extensions/project-export/export-configs/` for existing export implementations.
3. Register new configs in `services/madoc-ts/src/extensions/project-export/extension.ts`.

## Common Tasks
- Add a new export config type
- Adjust export file naming or metadata
- Update export configuration editor model

## Pitfalls
- Registering an export config without adding it to the extension constructor
- Returning file definitions with invalid paths or content types
- Mismatching supported resource types and contexts

## Suggested Checks
- Run an export for each supported resource type
- Verify generated file paths and metadata
