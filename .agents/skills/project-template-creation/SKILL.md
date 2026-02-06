---
name: project-template-creation
description: Create new Madoc TS project templates. Use when adding a new project template type, wiring template configuration/setup hooks, or defining capture model defaults for project creation in services/madoc-ts.
---

# Project Template Creation (Madoc TS)

## Goal
Provide a concise playbook for creating a new project template, explaining each template option and where it is used in the UI/server.

## Scope
- Template type definition and registration
- Template metadata, configuration, setup, hooks, and custom config
- Capture model and slot options used during project creation

## Non-scope
- General project routes unrelated to templates
- Task execution internals
- UI component styling

## Key Entry Points
- Template type: `services/madoc-ts/src/extensions/projects/types.ts`
- Template registry: `services/madoc-ts/src/extensions/projects/extension.ts`
- Built-in templates: `services/madoc-ts/src/extensions/projects/templates/`
- Project creation UI: `services/madoc-ts/src/frontend/admin/pages/crowdsourcing/projects/new-project.tsx`
- Template-based creation UI: `services/madoc-ts/src/frontend/admin/pages/crowdsourcing/projects/new-project-from-template.tsx`
- Template lookup hooks: `services/madoc-ts/src/frontend/shared/hooks/use-project-template.ts`
- Exported template format: `services/madoc-ts/src/routes/projects/export-project-template.ts`
- Plugin registration: `services/madoc-ts/src/frontend/shared/plugins/plugin-manager.ts`

## Template Anatomy
Use `ProjectTemplate` from `services/madoc-ts/src/extensions/projects/types.ts`.

### `type`
- Unique identifier for the template (used for registry + lookup).
- Referenced in:
  - Project create route (`/projects/create/:type`)
  - `useProjectTemplate()` and `useProjectTemplates()`
  - Template registration in `ProjectTemplateExtension`

### `metadata`
- Label/description/thumbnail shown in `new-project.tsx`.
- `actionLabel` labels the “Create project” button.
- `documentation` enables a “View documentation” link.

### `captureModel`
- Static capture model document/structure exported in templates.
- Used when importing remote templates or exporting a template (`export-project-template.ts`).

### `configuration`
- `defaults` and `immutable` are applied in configuration editor (`project-configuration.tsx`).
- `frozen` disables configuration UI for the project.
- `captureModels` controls editor behavior in `project-model-editor.tsx`.
- `tasks.generateOnCreate` / `tasks.generateOnNewContent` controls task generation (used by task pipeline).
- `status` maps project status labels in `frontend/shared/atoms/ProjectStatus.tsx`.

### `setup`
- Used by `new-project-from-template.tsx` to render “Additional settings” via `EditShorthandCaptureModel`.
- `model`: shorthand capture model schema for template options UI.
- `defaults`: default option values for the setup form.
- `modelPreview`: optional live preview for setup options.
- `onCreateConfiguration`: adjust the final `ProjectConfiguration` when a project is created.
- `onCreateProject`: perform follow-up actions after project creation.
- `beforeForkDocument` / `beforeForkStructure`: mutate capture model in the creation flow.
- `onCreateCustomConfiguration`: compute initial custom config values.

### `customConfig`
- Used in `new-project-from-template.tsx` to render a dedicated “Custom config” step.
- `replacesProjectConfig` disables standard config UI when true.
- `defaults`, `model`, and `applyConfig` drive custom config behavior.

### `customActions`
- Optional project-level actions, usually admin-only by default.

### `hooks`
- Hooks are consumed during project lifecycle events (revision creation/approval, content add/remove, review assignment).
- Commonly used by crowdsourcing and task flows.

### `migrations`
- Used to evolve template versions over time; run upgrades when template versions change.

### `components.customEditor`
- Optional UI override for custom editing flows.

## Registration Workflow
1. Create a new template file under `services/madoc-ts/src/extensions/projects/templates/`.
2. Export a `ProjectTemplate` object with a unique `type` and required `metadata`.
3. Register the template in `ProjectTemplateExtension` (`services/madoc-ts/src/extensions/projects/extension.ts`).
4. If the template should be plugin-provided, register via `PluginManager` plugin hook.

## Example (Minimal Template)
```ts
import { ProjectTemplate } from '../types';

export const myTemplate: ProjectTemplate = {
  type: 'my-template',
  metadata: {
    label: 'My Template',
    description: 'Describe what this template does.',
  },
};
```

## Pitfalls
- Forgetting to register the template in `ProjectTemplateExtension`.
- Using a non-unique `type` causing lookup collisions.
- Adding `setup.model` without `setup.defaults` (UI expects both).
- Marking config as `frozen` without providing custom config alternatives.

## Suggested Checks
- Template appears in admin “Create project” list.
- Template-based project creation succeeds with setup options.
- Project configuration UI respects `immutable` / `frozen` flags.
