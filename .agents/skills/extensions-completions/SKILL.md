---
name: extensions-completions
description: Work on Madoc TS completion sources and autocomplete backend integration. Use when adding completion sources, changing completion request handling, or updating external source integration in services/madoc-ts.
---

# Completions Extension (Madoc TS)

## Goal
Document how completion sources are registered and executed so autocomplete behavior remains consistent.

## Scope
- Completion source registration and execution
- Completion request parsing (query, language, paging)
- External source integration behavior

## Non-scope
- Frontend autocomplete UI
- Unrelated extensions or routing
- Capture model editor implementation

## Key Entry Points
- `services/madoc-ts/src/extensions/completions/extension.ts`
- `services/madoc-ts/src/extensions/completions/types.ts`
- `services/madoc-ts/src/extensions/completions/sources/`

## Architecture Summary (Based on Source)
- `CompletionsExtension` maintains a map of named `CompletionSource` implementations.
- `doCompletion` selects a source by type, builds query/language/page options, and returns completion items.
- Default sources include Wikidata and WorldCat FAST.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/completions/types.ts` for the source interface.
2. Inspect `services/madoc-ts/src/extensions/completions/sources/` for existing implementations.
3. Register any new sources in the `CompletionsExtension` constructor.

## Common Tasks
- Add a new completion source
- Update completion parsing rules (language, paging)
- Adjust external API query parameters

## Pitfalls
- Failing to register a new source in the constructor
- Returning completion items that do not match frontend expectations
- Unhandled errors from external APIs

## Suggested Checks
- Completion request for Wikidata and WorldCat FAST
- Completion request with paging and language override
