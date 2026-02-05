---
name: ssr-pipeline
description: Trace or modify Madoc TS server-side rendering for site and admin. Use when changing SSR output, template injection, dev HMR SSR wiring, or debugging SSR redirects and template tokens in services/madoc-ts.
---

# SSR Pipeline (Madoc TS)

## Overview
Explain how server-side rendering is performed for site and admin, how SSR output is injected into HTML templates, and how dev-mode HMR SSR output is constructed.

## Key Entry Points
- Site SSR handler: `services/madoc-ts/src/routes/frontend/site-frontend.ts`
- Admin SSR handler: `services/madoc-ts/src/routes/frontend/admin-frontend.ts`
- Site template: `services/madoc-ts/src/site.html`
- Admin template: `services/madoc-ts/src/admin.html`
- Client entrypoints referenced in templates:
  - `services/madoc-ts/src/frontend/site/client.ts`
  - `services/madoc-ts/src/frontend/admin/client.tsx`

## SSR Flow Summary (Based on Source)
- Both site and admin handlers set `context.staticPage` to an async renderer.
- Each renderer calls a corresponding `render*` function:
  - Site: `renderSite` from `src/frontend/site/server`
  - Admin: `renderAdmin` from `src/frontend/admin/server`
- The render result includes `body`, `head`, `htmlAttributes`, and `bodyAttributes`.
- If `result.type === 'redirect'`, the handler returns a redirect (status `result.status || 307`) or a `404` if no `to` is provided.
- In `NODE_ENV === 'development'`, HTML is built inline with Vite HMR scripts and a dynamic host-based dev URL (port `3088`).
- In non-dev, `context.siteTemplate` or `context.adminTemplate` is used, with token replacement:
  - `<!--ssr-outlet-->` replaced by `result.body`
  - `<!--ssr-head-->` replaced by `result.head`
  - `<html>` and `<body>` tags are replaced to include attributes from SSR output.

## Quick Start Workflow
1. Inspect `site-frontend.ts` and `admin-frontend.ts` to see how `context.staticPage` is set and how SSR results are injected.
2. Confirm template token usage in `site.html` and `admin.html`.
3. For dev SSR, verify HMR and client script injection for the correct entrypoints:
   - Site: `/src/frontend/site/client.ts`
   - Admin: `/src/frontend/admin/client.tsx`
4. If changing SSR output shape, ensure callers handle `result.type === 'redirect'` and `result.body/head` expectations.

## Development Mode Details
- Dev HTML includes `@react-refresh` and a `viteProtocol` derived from TLS certs at `/home/node/app/openssl-certs`.
- Hostname is taken from `context.request.hostname`.
- Site adds a stylesheet link to `src/frontend/site/index.css` in dev mode.

## Common Tasks
- Update SSR head/body injection
- Debug SSR redirect behavior
- Add SSR-injected assets (ensure matching template tokens)
- Troubleshoot dev HMR SSR boot failures

## Pitfalls
- Missing or renamed template tokens (`<!--ssr-head-->`, `<!--ssr-outlet-->`)
- Mismatch between SSR output and template replacement
- HMR dev URLs breaking on custom hostnames or protocol mismatch

## Suggested Checks
- One request to a site page (SSR HTML contains `result.head` and `result.body`)
- One request to an admin page (SSR HTML contains `result.head` and `result.body`)
- In dev, confirm the HMR preamble loads and the client entrypoints are correct
