---
name: madoc-extensions
description: Work on the Madoc TS extension and plugin system, ApiClient extension wiring, registry definitions, page blocks, project templates, project exports, media, themes, completions, site-manager APIs, or webhooks. Use when adding or changing extension-backed behavior in services/madoc-ts.
---

# Madoc Extensions

## Core model

- `src/extensions/extension-manager.ts` dispatches extension methods in order, passing each result to the next extension.
- `src/extensions/registry-extension.ts` stores built-ins plus site/plugin overrides and owns global emitter listeners.
- `src/gateway/api.ts` constructs the extension-backed API used on server and client.
- `src/middleware/create-plugin-manager.ts` and `src/frontend/shared/plugins/plugin-manager.ts` load and register plugin definitions.

When changing the framework, trace registration, lookup, plugin override, removal, and `dispose()`. Keep plugin loading inside the existing sandbox and path checks.

## Domain map

| Domain | Start here | Non-obvious check |
| --- | --- | --- |
| Capture-model client APIs | `src/extensions/capture-models/` | Keep revision contracts aligned with the capture-model server |
| Completions | `src/extensions/completions/` | Register the source and preserve paging/language/error behavior |
| Media | `src/extensions/media/`, `src/routes/media/`, `src/routes/assets/` | Keep storage paths, DB metadata, and thumbnail maps synchronized |
| Page blocks | `src/extensions/page-blocks/` | Declare context correctly and verify slot-resolved plus direct routes |
| Project exports | `src/extensions/project-export/` | Register the config; handle plans that produce zero files |
| Project templates | `src/extensions/projects/` | Register the template and trace each hook/config option to a real caller |
| Site manager | `src/extensions/site-manager/` | Update types and generated `get*` hooks with the API method |
| Themes | `src/extensions/themes/`, `src/frontend/themes/`, `themes/` | Check registry metadata and packaged build assets |
| Webhooks | `src/webhooks/` | Treat URL signing, validation, expiry, and public execution as security boundaries |

## Adding a project template

1. Read `src/extensions/projects/types.ts` and the nearest built-in template.
2. Add the template under `src/extensions/projects/templates/` with a unique `type` and only the options needed now.
3. Register it in `src/extensions/projects/extension.ts`, or through the plugin manager for a plugin-owned template.
4. Trace setup/configuration hooks through the creation UI before relying on them; the type contains hooks with no runtime caller.
5. Verify creation, immutable/frozen configuration, capture-model defaults, and any slot mappings.

## Guardrails

- Reuse the relevant registry; do not create a parallel registration mechanism.
- Preserve site-specific plugin override precedence and unregister definitions on removal.
- Add new `ApiClient` instances created in routes to `context.disposableApis`.
- For page blocks, follow the resource-context and SSR rules in `AGENTS.md`.
- For tabular exports, keep flags/notes readable rather than emitting internal JSON fields unchanged.

## Check

Exercise registration and removal plus one real domain flow. For plugins, test both the built-in definition and a site-scoped override.
