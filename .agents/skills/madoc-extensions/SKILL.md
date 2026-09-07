---
name: madoc-extensions
description: Madoc extension dispatch, plugin registries, and registration of blocks, templates, exports, or themes. Applies to extension behavior or registration changes; calling an existing ApiClient method alone does not need this skill.
---

# Madoc Extensions

## Framework contracts

- `src/extensions/extension-manager.ts` calls extensions in order with the original argument and an array of extra arguments; it returns the last successful result. It does not chain return values. Errors are logged and dispatch continues, so inspect callers before relying on failure propagation.
- `src/extensions/registry-extension.ts` owns built-ins, site/plugin definitions, and global emitter listeners. `getDefinition` prefers a matching site override; `getAllDefinitions` appends plugin entries to built-ins and can contain the same type twice.
- `src/gateway/api.ts` constructs extension-backed APIs. Registration runs through `src/middleware/create-plugin-manager.ts` and `src/frontend/shared/plugins/plugin-manager.ts`.

For framework changes, trace registration, lookup, override, removal, and `dispose()`. Preserve sandbox/path checks and listener cleanup.

## Domain entrypoints

| Domain | Source | Check when changing it |
| --- | --- | --- |
| Capture-model transforms | `src/extensions/capture-models/` | Actual dispatch behavior and server revision contracts |
| Completions | `src/extensions/completions/` | Source registration, paging, language and errors |
| Media | `src/extensions/media/`, `src/routes/media/`, `src/routes/assets/` | Storage paths, DB metadata and thumbnail maps |
| Page blocks | `src/extensions/page-blocks/` | Context/slot rules in `AGENTS.md`, including direct routes |
| Project exports | `src/extensions/project-export/` | Registered config, zero-file plans, readable tabular flags/notes |
| Project templates | `src/extensions/projects/` | Registration in `extension.ts`, creation-time configuration and slot mappings |
| Site manager | `src/extensions/site-manager/` | Types and corresponding frontend `get*` hooks |
| Themes | `src/extensions/themes/`, `src/frontend/themes/`, `themes/` | Registry metadata and packaged assets |
| Webhooks | `src/webhooks/` | URL signing, validation, expiry and public execution |

Before adding a project template, inspect `src/extensions/projects/types.ts` and a built-in under `templates/`. Use a unique `type` and trace any hook to a runtime caller; some declared hooks are unused. Check frozen configuration and capture-model defaults during creation.

## Verify

Exercise the changed domain flow. For registry/plugin changes, also check site-scoped override and removal, including fallback to the built-in definition.
