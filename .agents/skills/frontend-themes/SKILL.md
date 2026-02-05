---
name: frontend-themes
description: Work on Madoc TS theme packaging, site theme assets, and theme integration points. Use when adding or updating themes, theme assets, or theme extension wiring in services/madoc-ts.
---

# Frontend Themes (Madoc TS)

## Goal
Explain how themes are structured, packaged, and consumed so changes to themes or theme assets stay consistent.

## Scope
- Theme assets and packaging
- Theme usage in site/admin UI
- Theme integration with extensions

## Non-scope
- General UI component development
- Non-theme styling changes
- Unrelated extension types

## Key Entry Points
- `services/madoc-ts/src/frontend/themes/`
- `services/madoc-ts/src/extensions/themes/`
- `services/madoc-ts/themes/`
- `services/madoc-ts/src/frontend/site/`

## Quick Start Workflow
1. Review `services/madoc-ts/src/frontend/themes/` for base theme structure.
2. Inspect `services/madoc-ts/themes/` for packaged theme assets.
3. Check `services/madoc-ts/src/extensions/themes/` for theme extension registration.

## Common Tasks
- Add a new theme
- Update theme assets or styles
- Wire a theme into extension registration

## Pitfalls
- Theme assets not referenced in the build output
- Missing extension metadata for a new theme
- Inconsistent theme overrides across site/admin

## Suggested Checks
- Theme selection smoke test
- Site page render with target theme
