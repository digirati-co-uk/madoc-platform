---
name: plugin-system
description: Work on Madoc TS plugin loading, sandboxed module registration, and plugin-to-extension wiring. Use when modifying plugin load paths, plugin registration, or plugin integration points in services/madoc-ts.
---

# Plugin System (Madoc TS)

## Goal
Explain how plugins are loaded and registered so plugin installation and extension wiring remain consistent.

## Scope
- Plugin module loading and sandboxed require
- PluginManager registration for blocks, themes, templates, exports
- Plugin definition types and schemas

## Non-scope
- Extension implementations themselves
- Frontend rendering unrelated to plugins
- Route handlers for plugin APIs

## Key Entry Points
- `services/madoc-ts/src/middleware/create-plugin-manager.ts`
- `services/madoc-ts/src/frontend/shared/plugins/plugin-manager.ts`
- `services/madoc-ts/src/frontend/shared/plugins/`
- `services/madoc-ts/src/types/plugins`
- `services/madoc-ts/src/types/schemas/plugins`
- `services/madoc-ts/src/utility/sandboxed-require.ts`

## Architecture Summary (Based on Source)
- `create-plugin-manager.ts` loads plugin modules from `PLUGINS_PATH` using `sandboxedRequire` and returns a `PluginManager`.
- `PluginManager` registers plugin-provided blocks, themes, project templates, and exports via corresponding extension registries.
- Plugin definitions are typed in `types/plugins` and schema forms in `types/schemas/plugins`.

## Quick Start Workflow
1. Review `services/madoc-ts/src/middleware/create-plugin-manager.ts` for load paths and sandboxing.
2. Inspect `services/madoc-ts/src/frontend/shared/plugins/plugin-manager.ts` for registration/unregistration logic.
3. Update plugin type shapes in `types/plugins` and `types/schemas/plugins` if needed.

## Common Tasks
- Add a new plugin hook type
- Adjust plugin load path or development revision behavior
- Update plugin definition schema

## Pitfalls
- Loading plugins with invalid paths (path traversal)
- Registering plugin blocks/themes without source metadata
- Forgetting to unregister on plugin removal

## Suggested Checks
- Load a plugin in dev and verify hooks apply
- Uninstall plugin and confirm unregister flows
