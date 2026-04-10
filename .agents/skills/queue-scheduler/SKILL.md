---
name: queue-scheduler
description: Work on Madoc TS queue worker and scheduler setup using BullMQ. Use when updating task dispatch, worker configuration, or queue event handling in services/madoc-ts.
---

# Queue & Scheduler (Madoc TS)

## Goal
Document the queue worker and scheduler setup so task processing changes remain consistent and reliable.

## Scope
- BullMQ worker configuration and job handling
- Queue scheduler and event hooks
- Task dispatch selection and error handling

## Non-scope
- Cron job orchestration
- Automation bot logic
- Task definitions themselves

## Key Entry Points
- `services/madoc-ts/src/queue/producer.ts`
- `services/madoc-ts/src/queue/scheduler.ts`
- `services/madoc-ts/src/gateway/tasks/`

## Architecture Summary (Based on Source)
- Worker `producer.ts` uses BullMQ `Worker` with concurrency and Redis config.
- Job handling selects a task type and delegates to the corresponding `jobHandler` from `gateway/tasks/*`.
- Contextual APIs are created per job when a site ID is present in task context.
- `scheduler.ts` sets up BullMQ `QueueScheduler` and `QueueEvents` for logging and retries.

## Quick Start Workflow
1. Review `services/madoc-ts/src/queue/producer.ts` to understand job routing and error handling.
2. Inspect `services/madoc-ts/src/queue/scheduler.ts` for scheduler setup and event listeners.
3. Check `services/madoc-ts/src/gateway/tasks/` for task handlers when adding new task types.

## Common Tasks
- Add a new task handler switch case
- Adjust worker concurrency or Redis config
- Update queue event logging

## Pitfalls
- Forgetting to add a new task type to the switch in `producer.ts`
- Failing to dispose contextual API instances
- Changing Redis configuration without matching deployment config

## Suggested Checks
- Enqueue a task and verify worker processes it
- Confirm scheduler logs failures and restarts

## Tooling
- `scripts/queue_task_map.py`: map task type strings to handler modules.
  - Usage: `python scripts/queue_task_map.py`
