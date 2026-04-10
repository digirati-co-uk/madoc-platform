---
name: repository-patterns
description: Work on Madoc TS repository classes and data access patterns. Use when adding repository methods, refactoring DB access, or updating repository/query boundaries in services/madoc-ts.
---

# Repository Patterns (Madoc TS)

## Goal
Describe repository structure and usage so data access changes follow existing patterns and mappings.

## Scope
- Repository classes under `src/repository`
- Query reuse from `src/database/queries`
- Mapping rows to domain models

## Non-scope
- Route handlers and API controllers
- Migration scripts
- Frontend data fetching

## Key Entry Points
- `services/madoc-ts/src/repository/`
- `services/madoc-ts/src/repository/base-repository.ts`
- `services/madoc-ts/src/repository/project-repository.ts`
- `services/madoc-ts/src/database/queries/`

## Architecture Summary (Based on Source)
- Repositories extend `BaseRepository` to share a Slonik connection and optional flags.
- Repositories group `queries` and `mutations` as static helpers and expose instance methods that map results to domain models.
- Query helpers from `src/database/queries` are reused for common SQL fragments.

## Quick Start Workflow
1. Review the target repository file under `services/madoc-ts/src/repository/`.
2. Check for existing static `queries`/`mutations` helpers to reuse.
3. Use mapping helpers (e.g., `mapProjectUpdate`) to normalize result shapes.

## Common Tasks
- Add a repository method for a new feature
- Refactor queries into shared `queries`/`mutations`
- Adjust mapping logic for new columns

## Pitfalls
- Bypassing repository mappers and returning raw rows
- Changing query column names without updating mapping functions
- Adding DB access outside repositories when a repository already exists

## Suggested Checks
- Run a repository method against a dev database
- Verify mapped models match expected API shapes
