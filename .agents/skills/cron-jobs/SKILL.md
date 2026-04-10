---
name: cron-jobs
description: Work on Madoc TS cron job orchestration and scheduled maintenance tasks. Use when adding cron jobs, changing cron task behavior, or updating queue restart logic in services/madoc-ts.
---

# Cron Jobs (Madoc TS)

## Goal
Explain scheduled maintenance tasks so cron job additions and updates follow existing patterns.

## Scope
- Cron task definitions and behavior
- Queue restart/bounce routines
- Scheduled checks tied to projects and tasks

## Non-scope
- Queue worker implementation details
- Automation bot logic
- Non-cron background tasks

## Key Entry Points
- `services/madoc-ts/src/cron/`
- `services/madoc-ts/src/cron/bounce-queue.ts`
- `services/madoc-ts/src/cron/check-expired-manifests.ts`

## Architecture Summary (Based on Source)
- `bounce-queue.ts` restarts the queue and scheduler processes via PM2.
- `check-expired-manifests.ts` scans active projects and expires stale manifest tasks based on configured expiry windows.

## Quick Start Workflow
1. Review `services/madoc-ts/src/cron/check-expired-manifests.ts` for existing scheduled logic and DB usage.
2. Inspect `services/madoc-ts/src/cron/bounce-queue.ts` for process restart behavior.
3. Add new cron tasks in `services/madoc-ts/src/cron/` and wire them into the scheduler used by the app.

## Common Tasks
- Add a new maintenance cron job
- Adjust expiry window logic
- Update queue bounce behavior

## Pitfalls
- Using incorrect expiry config fields for time calculations
- Forgetting to restart queue/scheduler in the correct order
- Running cron logic without required DB context

## Suggested Checks
- Run cron task manually in a dev environment
- Confirm expired manifest tasks update status correctly
