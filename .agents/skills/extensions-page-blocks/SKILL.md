---
name: extensions-page-blocks
description: Work on Madoc TS page block extension definitions, editors, and rendering hooks. Use when adding page block types, updating block editors, or changing block rendering flow in services/madoc-ts.
---

# Page Block Extensions (Madoc TS)

## Goal
Explain how page blocks are defined and rendered so new blocks or editor changes integrate with the registry and rendering pipeline.

## Scope
- Page block definitions and registry
- Block editor wiring and block config helpers
- Block rendering to HTML/React and slot/page APIs

## Non-scope
- General site routes or admin routes
- Unrelated extension types
- Frontend styling not tied to blocks

## Key Entry Points
- `services/madoc-ts/src/extensions/page-blocks/extension.ts`
- `services/madoc-ts/src/extensions/page-blocks/default-definitions.ts`
- `services/madoc-ts/src/extensions/page-blocks/block-editor-for.ts`
- `services/madoc-ts/src/extensions/page-blocks/simple-html-block/`
- `services/madoc-ts/src/extensions/page-blocks/simple-markdown-block/`

## Architecture Summary (Based on Source)
- `PageBlockExtension` is a `RegistryExtension` using registry name `block` and supports plugin overrides.
- Definitions can be filtered by required/optional context in `getDefinitions`.
- Blocks can render as React or HTML; React rendering uses server-side rendering or client-side render-to-string.
- Slot/page CRUD APIs are exposed via `/api/madoc/pages`, `/api/madoc/slots`, `/api/madoc/blocks`.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/page-blocks/extension.ts` for definition structure and rendering flow.
2. Inspect `services/madoc-ts/src/extensions/page-blocks/default-definitions.ts` to see default block registrations.
3. Use `block-editor-for.ts` or add a new definition file to register a custom block.

## Common Tasks
- Add a new page block definition
- Update block editor UI or block config mapping
- Adjust block rendering output

## Pitfalls
- Registering blocks with the wrong registry name (`block`)
- Missing required context constraints, causing blocks to appear incorrectly
- Breaking SSR rendering by returning invalid HTML

## Suggested Checks
- Create a new block in the admin UI
- Render a page with the new block in SSR and client
