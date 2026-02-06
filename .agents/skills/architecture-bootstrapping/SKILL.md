---
name: architecture-bootstrapping
description: Map and modify Madoc TS startup, server composition, routing setup, and SSR entrypoints. Use when tracing request flow, adding top-level middleware, wiring new services at boot, or debugging startup/SSR integration for services/madoc-ts.
---

# Architecture & Bootstrapping (Madoc TS)

## Goal
Explain how Madoc TS starts, how servers and routers are composed, and where SSR is wired in so agents can safely trace or change app boot flow.

## Scope
- App startup and server wiring
- Router construction and top-level middleware
- SSR integration points and HTML templates

## Non-scope
- Feature-level route handlers
- Business logic in extensions or repositories
- UI component implementation

## Key Entry Points
- `services/madoc-ts/src/index.ts`
- `services/madoc-ts/src/server.ts`
- `services/madoc-ts/src/app.ts`
- `services/madoc-ts/src/router.ts`
- `services/madoc-ts/src/paths.ts`
- `services/madoc-ts/src/config.ts`
- `services/madoc-ts/src/routes/frontend/site-frontend.ts`
- `services/madoc-ts/src/routes/frontend/admin-frontend.ts`
- `services/madoc-ts/src/site.html`
- `services/madoc-ts/src/admin.html`

## Quick Start Workflow
1. Read `services/madoc-ts/src/index.ts` to locate the primary startup path.
2. Follow through `services/madoc-ts/src/server.ts` and `services/madoc-ts/src/app.ts` to understand server creation and middleware ordering.
3. Inspect `services/madoc-ts/src/router.ts` for route assembly and registration conventions.
4. Review `services/madoc-ts/src/paths.ts` and `services/madoc-ts/src/config.ts` for runtime configuration, defaults, and env wiring.
5. For SSR, inspect `services/madoc-ts/src/routes/frontend/site-frontend.ts` and `services/madoc-ts/src/routes/frontend/admin-frontend.ts` plus `services/madoc-ts/src/site.html` and `services/madoc-ts/src/admin.html` templates.

## Common Tasks
- Add top-level middleware
- Trace startup failures and misconfiguration
- Add a new top-level server capability
- Update SSR template injection points

## Workflow Guidance
- Start with the top-level entrypoint and move inward. Do not jump directly to route handlers.
- Keep middleware ordering in mind. The earliest registered middleware will affect all routes.
- When changing SSR, verify both the server route handler and the HTML template tokens (`<!--ssr-head-->`, `<!--ssr-outlet-->`).

## Useful Local Searches
- `rg -n "createServer|listen|app" services/madoc-ts/src`
- `rg -n "router|routes" services/madoc-ts/src/router.ts`
- `rg -n "ssr" services/madoc-ts/src/routes/frontend services/madoc-ts/src/*.html`

## Pitfalls
- Breaking middleware ordering and auth guard placement
- Changing SSR output without matching template tokens
- Introducing config defaults that diverge between environments

## Suggested Checks
- Boot smoke test for server startup
- One admin page SSR request
- One site page SSR request
