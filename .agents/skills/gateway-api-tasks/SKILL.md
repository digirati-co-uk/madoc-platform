---
name: gateway-api-tasks
description: Work on Madoc TS API client wiring and gateway task definitions. Use when modifying ApiClient behavior, adding task types, or changing task handler integration in services/madoc-ts.
---

# Gateway API & Tasks (Madoc TS)

## Goal
Explain how the ApiClient composes extensions and how gateway task types are defined so task execution and API calls stay consistent.

## Scope
- ApiClient construction and extension wiring
- Gateway task type definitions and handlers
- Task type strings and request payloads

## Non-scope
- Queue worker implementation details
- Route handler logic outside the gateway
- Frontend components

## Key Entry Points
- `services/madoc-ts/src/gateway/api.ts`
- `services/madoc-ts/src/gateway/api.server.ts`
- `services/madoc-ts/src/gateway/api.browser.ts`
- `services/madoc-ts/src/gateway/tasks/`
- `services/madoc-ts/src/gateway/tasks/base-task.ts`

## Architecture Summary (Based on Source)
- `ApiClient` composes extension instances (page blocks, media, themes, tasks, site manager, etc.) and is the primary API surface for both server and client.
- Gateway tasks define their type strings and handler entrypoints; queue worker dispatches by task `type`.
- Task payloads flow through BaseTask shape and per-task state/metadata conventions.

## Quick Start Workflow
1. Review `services/madoc-ts/src/gateway/api.ts` for ApiClient lifecycle and extension wiring.
2. Inspect the relevant task file in `services/madoc-ts/src/gateway/tasks/` for `type` and handler behavior.
3. If adding a task, update queue worker mappings and any API client helpers.

## Common Tasks
- Add a new task type
- Extend an existing task payload or state
- Adjust ApiClient extension wiring

## Pitfalls
- Adding a task without updating queue dispatch
- Mutating ApiClient extension fields without disposing correctly
- Changing task type strings without updating producers/consumers

## Suggested Checks
- Create a task and verify its handler is reached
- Validate ApiClient extension wiring in both server and browser contexts
