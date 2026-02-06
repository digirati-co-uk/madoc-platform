---
name: tasks-automation
description: Understand and extend Madoc TS task automation, including bots and task-related extensions. Use when adding task automation, bot behavior, or task metadata resolution in services/madoc-ts.
---

# Tasks & Automation (Madoc TS)

## Overview
Describe how automated bots are defined and triggered, and how task metadata resolution works through the task extension.

## Key Entry Points
- Automation entrypoint: `services/madoc-ts/src/automation/index.ts`
- Bot definitions: `services/madoc-ts/src/automation/bot-definitions.ts`
- Bot implementations: `services/madoc-ts/src/automation/bots/**`
- Task extension: `services/madoc-ts/src/extensions/tasks/extension.ts`
- Task resolvers: `services/madoc-ts/src/extensions/tasks/resolvers/**`

## Automation Flow Summary (Based on Source)
- Bots are registered in `automation/index.ts` and mapped to site bot configs (`siteBots`).
- `execBot()`:
  - Looks up automated users via `api.asUser({ siteId, userId }).getAutomatedUsers()`.
  - Matches the bot type from user config.
  - Matches the bot’s task event map (`Bot.getTaskEvents()`).
  - Creates a bot instance with `api.asUser(..., true)` and calls `handleTaskEvent()`.
- Example bot: `AutomaticReviewBot` listens for `crowdsourcing-review` events (`created`, `assigned`) and auto-approves submissions when config allows.

## Task Extension Summary (Based on Source)
- `TaskExtension` provides task metadata resolution using resolver classes.
- It can update task metadata via `PATCH /api/tasks/:id/metadata`.
- It fetches missing metadata via `/madoc/api/task-metadata/:id` when needed.
- Resolvers decide whether metadata exists and how to fetch it.

## Quick Start Workflow
1. Identify if you’re modifying **bot automation** or **task metadata resolution**.
2. For bots:
   - Add or update a bot in `automation/bots/`.
   - Register the bot type and metadata in `bot-definitions.ts`.
   - Ensure `execBot()` can match your bot type and events.
3. For task metadata:
   - Update or add a resolver under `extensions/tasks/resolvers/`.
   - Ensure `TaskExtension` includes the resolver.

## Common Tasks
- Add a new bot for a specific task type
- Update bot trigger events
- Add or refine task metadata resolvers
- Debug task automation behavior

## Pitfalls
- Bot type not matching `siteBots` config
- Missing event mapping in `getTaskEvents()`
- Resolver not wired into `TaskExtension` constructor

## Suggested Checks
- Trigger a task event and confirm `execBot()` calls the bot
- Verify metadata resolution populates `task.metadata`
