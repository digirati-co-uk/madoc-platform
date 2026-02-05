---
name: db-migrations
description: Work on Madoc TS database migrations and migration tooling. Use when adding SQL migrations, running Slonik migrator, or updating migration paths in services/madoc-ts.
---

# Database Migrations (Madoc TS)

## Goal
Explain how migrations are organized and executed so new migration scripts are added safely and run correctly.

## Scope
- Migration file layout and naming
- Slonik migrator setup and entrypoints
- Environment variables required for migrations

## Non-scope
- Query implementation details
- Repository patterns
- Runtime DB pool configuration outside migration runs

## Key Entry Points
- `services/madoc-ts/migrations/`
- `services/madoc-ts/src/migrate.ts`
- `services/madoc-ts/migrate.cjs`

## Architecture Summary (Based on Source)
- Migrations live in `services/madoc-ts/migrations` and are executed via `@slonik/migrator`.
- `src/migrate.ts` uses `ROOT_PATH` + `/migrations` to locate migration files.
- `migrate.cjs` is a CommonJS entrypoint with the same migrations path.

## Quick Start Workflow
1. Review existing migration files in `services/madoc-ts/migrations/` for naming and structure.
2. Confirm `DATABASE_*` env vars are set for the migration run.
3. Use `services/madoc-ts/src/migrate.ts` (or `migrate.cjs`) to execute migrations.

## Common Tasks
- Add a new SQL migration file
- Run migrations in a dev or deployment environment
- Fix migration order or dependencies

## Pitfalls
- Incorrect migration filename format
- Running migrations without required environment variables
- Changing migration path without updating both TS and CJS entrypoints

## Suggested Checks
- Run migrator on a clean database
- Verify new migration applies and is idempotent where expected

## Tooling
- `scripts/list_migrations.py`: list migration files in order.
  - Usage: `python scripts/list_migrations.py`
