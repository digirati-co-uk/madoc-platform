---
name: notifications-webhooks
description: Work on Madoc TS webhook routing, execution, and registry behavior. Use when adding webhook events, adjusting webhook routes, or modifying webhook signing/validation in services/madoc-ts.
---

# Notifications & Webhooks (Madoc TS)

## Overview
Explain how webhook routes are wired, how webhook definitions are registered, and how webhook URLs are signed/validated.

## Key Entry Points
- Webhook router: `services/madoc-ts/src/webhooks/router.ts`
- Webhook extension: `services/madoc-ts/src/webhooks/webhook-extension.ts`
- Webhook server extension: `services/madoc-ts/src/webhooks/webhook-server-extension.ts`
- Webhook types/utilities: `services/madoc-ts/src/webhooks/webhook-types.ts`, `webhook-utils.ts`

## Flow Summary (Based on Source)
- Routes are registered in `webhooks/router.ts` for CRUD, execution, and testing.
- `WebhookExtension` wraps API calls for listing, creating, updating, and executing webhooks.
- `WebhookServerExtension` is a registry extension that:
  - Registers webhook definitions (including plugin overrides).
  - Generates signed webhook URLs with JWS (`sign`).
  - Validates webhook signatures (`validate`) against public keys.
- Public execution endpoint: `/s/:slug/madoc/api/webhook`.

## Quick Start Workflow
1. Identify the webhook route you need to add or change in `webhooks/router.ts`.
2. If adding a new webhook type, register it with `WebhookServerExtension.register`.
3. For outgoing webhooks, ensure signing/validation rules are consistent with `sign`/`validate`.
4. Update client-side access via `WebhookExtension` if needed.

## Common Tasks
- Add a new webhook event definition
- Update signing or expiry logic
- Add or adjust webhook CRUD endpoints
- Debug webhook execution and validation failures

## Pitfalls
- Mismatched event ids between registry and execution
- Incorrect signature validation window
- Missing plugin-specific overrides for webhook definitions

## Suggested Checks
- Generate a webhook URL and validate it
- Execute a test webhook and confirm payload delivery
