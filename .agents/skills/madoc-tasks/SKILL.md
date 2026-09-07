---
name: madoc-tasks
description: Madoc background task dispatch, event subscriptions, retries, bots, and cron scheduling. Applies to asynchronous execution changes; contribution/review policy belongs to madoc-crowdsourcing.
---

# Madoc Tasks

## Wiring

- Task definitions/handlers: `src/gateway/tasks/`
- Worker dispatch/failure handling: `src/queue/producer.ts`
- BullMQ scheduler/events: `src/queue/scheduler.ts`
- Task API and metadata resolvers: `src/extensions/tasks/`
- Bots: `src/automation/index.ts`, `src/automation/bot-definitions.ts`, `src/automation/bots/`
- Cron jobs: `src/cron/`; registration/shutdown: `src/app.ts`; admin listing: `src/routes/admin/list-jobs.ts`

For a worker-handled task, trace its type, `events` subscriptions, creation/enqueue path, and producer switch case. An imported handler without matching event routing is inert. Structural tasks need no worker case unless they execute work.

A bot needs metadata, implementation registration, and an event mapping. A task metadata resolver must be wired into the task extension. Cron runs in the server process under the instance-zero gate, with cancellation on shutdown; the PM2 `scheduler` process handles BullMQ scheduling.

## Failure and recovery

- Preserve task `status`/`status_text` and the worker failure listener's `state.error` for the admin view. Keep job site-context isolation and contextual API cleanup on success and failure.
- The producer treats a handler's 404 as handled and ignores unknown task types. Account for these paths when diagnosing jobs marked complete without work; do not generalize them to other errors.
- For independent fan-out, create all expected children before waiting for completion so one failed child does not prevent sibling creation.
- Gate parent completion on every required child output, not just a `done` status. Recovery must explicitly retry or skip completed children with missing outputs; inspect side effects before replaying work.

## Verify

Run a representative task through its actual event/enqueue path and inspect state transitions and failure behavior. Trigger the changed bot event or cron job directly. Use the process build/restart rules in `AGENTS.md`: `queue` for producer changes, `scheduler` for BullMQ scheduling, `server` for cron.
