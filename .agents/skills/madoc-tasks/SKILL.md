---
name: madoc-tasks
description: Work on Madoc TS task definitions and handlers, BullMQ producer/scheduler wiring, task dispatch, automation bots, task metadata resolvers, cron jobs, retries, and task status/failure behavior in services/madoc-ts.
---

# Madoc Tasks

Use `$madoc-crowdsourcing` as well when the task is specifically about claim, contribution, or review lifecycle policy.

## Source map

- Task definitions and handlers: `src/gateway/tasks/`
- Worker dispatch and failure handling: `src/queue/producer.ts`
- BullMQ scheduler/events: `src/queue/scheduler.ts`
- Task API facade and metadata resolvers: `src/extensions/tasks/`
- Bot registration and implementations: `src/automation/index.ts`, `src/automation/bot-definitions.ts`, `src/automation/bots/`
- Cron implementations: `src/cron/`
- Cron registration and shutdown: `src/app.ts`
- Cron admin endpoints: `src/router.ts`, `src/routes/admin/list-jobs.ts`

## Add a task type

1. Define the task type, creation/enqueue path, and handler beside the nearest existing task.
2. Add the worker import and switch case in `src/queue/producer.ts`.
3. Preserve task `status` and `status_text` on success and retry; terminal failures must also store a concise reason in `state.error` for the admin task view.
4. Dispose contextual `ApiClient` instances on every path.
5. Rebuild `vite-producer`, restart PM2 `queue`, and run one real task.

## Bots and cron

- A bot needs metadata in `bot-definitions.ts`, a registered implementation in `automation/index.ts`, and an event mapping.
- A metadata resolver must be added to the task extension, not only created in `resolvers/`.
- A cron implementation is inert until registered in `src/app.ts`; ensure shutdown cancels it.
- Restart `scheduler` only for BullMQ scheduler changes; cron jobs run in the server process.

## Guardrails

- Trace every producer and consumer before changing a task type string or payload.
- Queue independent fan-out subtasks together, then gate parent completion on every expected child; a failed child must not prevent siblings from being created.
- Treat a child as complete only when its required output state is present; recovery must explicitly retry or skip `done` children with missing outputs.
- Keep retryable errors retryable; do not turn unknown failures into successful jobs.
- Preserve the worker's site-context isolation and cleanup.

## Check

Enqueue one representative task and confirm dispatch, state transitions, failure behavior, and PM2 health. For bot or cron changes, trigger the exact event/job rather than only importing the module.
