---
name: i18n
description: Work on Madoc TS internationalization setup for server and client. Use when changing i18next backend configuration, language detection, or locale loading in services/madoc-ts.
---

# I18n (Madoc TS)

## Goal
Document the i18n setup so locale detection and translation loading remain consistent across server and client.

## Scope
- Server-side i18next setup
- Client-side i18next setup
- Locale loading paths and detection order

## Non-scope
- Translation file contents
- Frontend component wording
- Non-i18n middleware

## Key Entry Points
- `services/madoc-ts/src/middleware/i18n/i18next.server.ts`
- `services/madoc-ts/src/middleware/i18n/i18next.client.ts`
- `services/madoc-ts/src/utility/language-cache.ts`
- `services/madoc-ts/src/paths.ts`

## Architecture Summary (Based on Source)
- Server uses `koa-i18next-detector` and a `LanguageCache` backend with `TRANSLATIONS_PATH`.
- Client uses chained backend (localStorage cache + HTTP fallback) and browser language detection.
- Locale endpoints are served under `/s/{slug}/madoc/api/locales/{lng}/{ns}`.

## Quick Start Workflow
1. Review server config in `i18next.server.ts` for detection order and load paths.
2. Review client config in `i18next.client.ts` for backend chain and detection rules.
3. If adding namespaces, update both server and client to keep them aligned.

## Common Tasks
- Add a new translation namespace
- Adjust language detection order
- Change locale loading paths

## Pitfalls
- Mismatched namespaces between server and client
- Forgetting to update translation load paths after route changes
- Breaking cached language behavior by changing detector settings

## Suggested Checks
- Load a page with a non-default locale cookie/querystring
- Verify client fetches locale JSON from the expected endpoint
