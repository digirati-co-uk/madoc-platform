---
name: automation-bots
description: Work on Madoc TS automation bots, bot definitions, and task event handling. Use when adding new bots, updating bot triggers, or changing bot execution flows in services/madoc-ts.
---

# Automation Bots (Madoc TS)

## Goal
Explain how automation bots are defined and invoked so new bots and task handlers integrate safely.

## Scope
- Bot definitions and metadata
- Bot execution and task event handling
- Manual bot actions

## Non-scope
- Queue worker infrastructure
- Cron job orchestration
- General task definitions outside automation

## Key Entry Points
- `services/madoc-ts/src/automation/bot-definitions.ts`
- `services/madoc-ts/src/automation/bots/`
- `services/madoc-ts/src/automation/index.ts`
- `services/madoc-ts/src/automation/utils/BaseAutomation.ts`
- `services/madoc-ts/src/automation/utils/ManualActions.ts`
- `services/madoc-ts/src/automation/utils/TaskAutomation.ts`

## Architecture Summary (Based on Source)
- Bots are listed in `bot-definitions.ts` with metadata and site role.
- `automation/index.ts` maps task events to bots and executes them as automated users.
- `BaseAutomation` enforces automated-user checks and exposes config, task, and manual action hooks.
- `AutomaticReviewBot` listens for `crowdsourcing-review` events and auto-approves tasks when configured.

## Quick Start Workflow
1. Review `services/madoc-ts/src/automation/index.ts` to understand how bots are dispatched for task events.
2. Inspect `services/madoc-ts/src/automation/bots/` for existing bot patterns.
3. Add bot metadata to `services/madoc-ts/src/automation/bot-definitions.ts` and register the class in `automation/index.ts`.

## Common Tasks
- Add a new automation bot type
- Update bot event triggers or actions
- Extend manual bot actions

## Pitfalls
- Forgetting to register bot class in `automation/index.ts`
- Missing automated user configuration for a bot
- Triggering bot actions without required task fields

## Suggested Checks
- Trigger a supported task event and verify bot execution
- Run manual bot action if applicable
