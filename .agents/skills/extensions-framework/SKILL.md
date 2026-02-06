---
name: extensions-framework
description: Understand and extend the Madoc TS extension framework. Use when adding extensions, registry definitions, or plugin-backed extension behavior in services/madoc-ts.
---

# Extensions Framework (Madoc TS)

## Overview
Describe how extensions are composed, registered, and invoked, including registry-based extensions and plugin overrides.

## Key Entry Points
- Extension manager: `services/madoc-ts/src/extensions/extension-manager.ts`
- Registry base class: `services/madoc-ts/src/extensions/registry-extension.ts`
- Extension modules: `services/madoc-ts/src/extensions/**`
- Example registry extension: `services/madoc-ts/src/extensions/themes/extension.ts`

## Framework Summary (Based on Source)
- `ExtensionManager` holds a list of extensions and dispatches method calls to each extension in order.
- `dispatch` chains results by passing the return value of each extension to the next.
- `RegistryExtension` uses a global `mitt` emitter to register and manage definitions.
- Registry supports:
  - Base definitions by `type`
  - Plugin-specific overrides (`plugin-${registryName}`)
  - Removal events (`remove-plugin-${registryName}`)
- Pre-registered events are buffered before registry construction and replayed on initialization.

## Quick Start Workflow
1. Identify the extension domain under `src/extensions/**` (e.g., themes, media, tasks).
2. If it’s a registry extension, check how it derives from `RegistryExtension`.
3. For plugin overrides, use the `plugin-<registry>` event registration pattern.
4. For lifecycle management, confirm `dispose()` is implemented (often via `defaultDispose`).

## Common Tasks
- Add a new extension class and register it
- Add a new registry definition or plugin override
- Extend an extension’s API and update `ExtensionManager` call patterns

## Pitfalls
- Forgetting to unregister event listeners in `dispose()`
- Missing plugin override behavior when adding new definitions
- Failing to chain return values correctly in `dispatch`

## Suggested Checks
- Extension load and dispose are exercised without leaks
- Registry `getDefinition` returns plugin override when present

## Tooling
- `scripts/registry_map.py`: list RegistryExtension subclasses and registry names.
  - Usage: `python scripts/registry_map.py`
