---
name: extensions-themes
description: Work on Madoc TS theme extension registration, theme API calls, and theme lifecycle management. Use when adding theme extension definitions, plugin overrides, or theme API flows in services/madoc-ts.
---

# Theme Extensions (Madoc TS)

## Goal
Explain how theme extensions are registered and how theme management APIs are called so new themes and overrides are integrated correctly.

## Scope
- Theme extension registration via registry
- Theme API calls for list/install/enable/disable
- Plugin overrides for themes

## Non-scope
- Theme asset contents and styling changes
- Frontend component styling
- Unrelated extensions

## Key Entry Points
- `services/madoc-ts/src/extensions/themes/extension.ts`
- `services/madoc-ts/src/extensions/registry-extension.ts`
- `services/madoc-ts/src/types/themes`

## Architecture Summary (Based on Source)
- `ThemeExtension` is a `RegistryExtension` with registry name `themes`.
- The extension registers and removes plugin overrides through the shared emitter.
- Theme management flows call `/api/madoc/system/themes*` endpoints for list, get, install, enable, disable, and uninstall.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/themes/extension.ts` for registry and API methods.
2. Inspect `services/madoc-ts/src/extensions/registry-extension.ts` to understand registry/plugin event handling.
3. Confirm theme type shapes under `services/madoc-ts/src/types/themes`.

## Common Tasks
- Register a new theme definition
- Add a plugin-scoped theme override
- Update theme management API calls

## Pitfalls
- Using the wrong registry name (`themes`)
- Forgetting to emit plugin register/remove events
- Updating endpoints without matching backend API routes

## Suggested Checks
- Theme list API call
- Install + enable theme sequence
