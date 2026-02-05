---
name: extensions-projects
description: Work on Madoc TS project template extensions and project creation hooks. Use when adding project templates, updating project extension hooks, or adjusting template metadata in services/madoc-ts.
---

# Project Extensions (Madoc TS)

## Goal
Describe how project templates are registered and extended so new project types and hooks follow existing patterns.

## Scope
- Project template registration and registry events
- Template metadata, configuration defaults, and hooks
- Template components and custom actions

## Non-scope
- Project API routes outside extension templates
- Task execution and queueing
- Frontend page layout unrelated to projects

## Key Entry Points
- `services/madoc-ts/src/extensions/projects/extension.ts`
- `services/madoc-ts/src/extensions/projects/types.ts`
- `services/madoc-ts/src/extensions/projects/templates/`
- `services/madoc-ts/src/extensions/registry-extension.ts`
- `services/madoc-ts/src/extensions/projects/README.md`

## Architecture Summary (Based on Source)
- `ProjectTemplateExtension` is a `RegistryExtension` with registry name `project-template`.
- Default templates are registered in the constructor (metadata suggestions, custom project, crowdsourced transcription, OCR correction).
- `ProjectTemplate` supports configuration defaults, custom config, lifecycle hooks, and UI components.

## Quick Start Workflow
1. Review `services/madoc-ts/src/extensions/projects/types.ts` to understand template shape and hooks.
2. Inspect `services/madoc-ts/src/extensions/projects/templates/` for existing templates.
3. Add/register new templates in `services/madoc-ts/src/extensions/projects/extension.ts`.

## Common Tasks
- Add a new project template
- Adjust template metadata or defaults
- Add hooks for project lifecycle events

## Pitfalls
- Failing to register templates in the extension constructor
- Missing required metadata fields or capture model configuration
- Hook side effects that assume project state too early

## Suggested Checks
- Project creation using the new template
- Template metadata renders in the UI
- Hooked actions run without errors
