# AGENTS.md (madoc-ts)

This is the default instruction file for agents working in `services/madoc-ts`.
Use it as the cross-cutting guide for how Madoc works, how to change it safely, and how to verify changes locally.

## Philosophy

- No area is off-limits — some just need more care
- Understand before modifying — read code, tests, trace calls
- Ask when uncertain — ambiguity warrants a question
- Flag sensitive changes — tell the user when touching elevated care zones

## Scope and skill usage

- Keep README/docs human-focused; keep this file agent-focused.
- This file is self-contained, but skills still apply. If a task matches a skill, use it for subsystem-specific workflow and constraints.
- Do not duplicate deep skill instructions here; use this file for repository-wide rules and architecture context.

## Skill upkeep

- If you learn a reusable workflow, recurring pitfall, or domain rule that is not captured in an existing skill, create a new skill.
- If you modify behavior in an area already covered by a skill, update that skill in the same change so instructions stay accurate.
- If you find a mistake or outdated guidance in a skill, fix it immediately.
- Keep skill changes concise and practical; avoid duplicating this AGENTS file inside skills.

## Madoc runtime model (high-level)

- `madoc-ts` runs as multiple PM2 apps in one container: `server`, `auth`, `queue`, `scheduler`.
- Entrypoints are `entrypoint/server.cjs`, `entrypoint/auth.cjs`, `entrypoint/producer.cjs`, `entrypoint/scheduler.cjs`.
- These load built bundles from `dist/server`, `dist/auth`, `dist/producer`, `dist/scheduler`.
- Startup and middleware wiring live in `src/app.ts`.
- Route registration is centralized in `src/router.ts` using `TypedRouter`.
- Site routing tree is in `src/frontend/site/routes.tsx`.
- Page-block and slot context behavior live in `src/extensions/page-blocks/extension.ts`.

## Request pipeline and auth behavior

- Core middleware order matters: parse/set JWT, site state, static page handling, then router.
- `TypedRouter` applies middleware by HTTP method:
- `GET`: `parseJwt` + `siteState` unless route is explicitly `isPublic`.
- `POST`/`PUT`/`PATCH`: `parseJwt` + `requestBody(schemaName)`.
- Unauthorized/scope failures often intentionally return `NotFound`; preserve this behavior unless a task explicitly changes auth semantics.
- When creating scoped API clients in routes (`api.asUser(...)`), add them to `context.disposableApis` so `dispose-apis` can clean up.

## Frontend rendering and data-loading model

- Site/admin are SSR-first; dev mode injects Vite client from port `3088`.
- Route loaders use `createUniversalComponent(..., { getKey, getData, hooks, noSsr })`.
- Keep loader keys deterministic and stable (same params/query -> same key) to avoid hydration/query-cache drift.
- Prefer `useData` / `useStaticData` and `ApiClient` extension methods over ad-hoc `fetch`.
- SSR-safe rule: do not use `window`/`document`/browser APIs without explicit guard (`api.getIsServer()` or equivalent).
- Build links with `createLink`/`useRelativeLinks`; avoid hardcoded URL strings that lose context.

## Frontend context model (critical)

- Site pages run in resource context. A page can have zero or more of `projectId`, `collectionId`, `manifestId`, `canvasId`, `taskId`.
- Context is merged from URL params and slot context in `src/frontend/site/hooks/use-route-context.ts`.
- The special `/model` route exists on manifest/canvas flows and must be handled explicitly when adding route-aware logic.
- `PageLoader` builds `EditorialContext` and provides slot context (`project`, `collection`, `manifest`, `canvas`) for page blocks.

## Page blocks, slots, and templates

- Page blocks are context-aware and can render on many pages when required context matches.
- When adding/changing a block, define `requiredContext` / `anyContext` correctly and keep behavior safe when optional context is missing.
- Default site pages use slot-driven blocks, but most pages are customizable.
- New optional features should be implemented as blocks/slot config where possible, not hardcoded page-only behavior.
- Project templates can inject slot mappings at project creation (see `create-new-project` flow), so slot compatibility matters for custom templates.
- If feature behavior depends on page location, test it in both direct routes and slot-resolved routes.

## API and route change checklist

- If a new backend endpoint is needed, wire it fully:
- handler in `src/routes/...`
- route entry in `src/router.ts`
- request schema in `schemas/` and `schemaName` in route options when request body is validated
- `ApiClient` method in `src/gateway/api.ts` when frontend/server consumers need it
- Use route names and `context.routes.url(...)` for server-generated links (emails, redirects, callbacks) instead of hardcoding URL fragments.
- Keep route permissions explicit with `userWithScope` / `onlyGlobalAdmin` and avoid leaking partial access paths.

## Styling and component conventions

- Tailwind is the forward path.
- Do not add new `styled-components` code for feature work.
- If you need to modify a component currently implemented with `styled-components`, migrate that component/file to Tailwind in the same change so it is fully compatible, rather than incrementally extending legacy styles.
- Keep behavior parity during migration (no silent UI regressions).
- Prefer small, focused files and clear abstractions; avoid large multi-component files.
- Prefer typed function components with explicit props types. Avoid `React.FC` in new/updated code.

## Hooks and state management

- A few hooks in a component is normal.
- When a component grows complex hook orchestration (many interdependent hooks, complex `useReducer`, difficult effect ordering), prefer extracting state to a small Zustand store.
- Use Zustand sparingly and by feature/domain; do not move simple local state into global stores.
- If moving to Zustand, keep the store local to the feature folder and expose minimal selectors to avoid broad rerender chains.

## Testing strategy

- Prioritize tests for critical behavior: data transforms, workflow/state transitions, permission logic, queue/task behavior, and route/business logic.
- Do not prioritize UI rendering tests for presentational components.
- Avoid brittle tests that require heavy DB mocking unless there is no practical alternative.
- Prefer tests with stable inputs/outputs and low maintenance cost.
- For bugs fixed in complex logic, add a focused regression test where practical.

## Queue and async task wiring

- New task types must be wired end-to-end: task definition/handler, enqueue path, and `src/queue/producer.ts` switch handling.
- Preserve task status transitions and failure behavior (`status`, `status_text`) so task UIs remain accurate.
- If you change producer/worker logic, rebuild `vite-producer` and restart PM2 `queue`.

## Database and migration discipline

- Use forward-only migrations in `migrations/`; do not edit old migrations that may already be applied.
- If request/response contracts or schema-backed validation change, update relevant schema artifacts and generated outputs.
- Prefer existing query/repository patterns over route-local SQL when the repository/query module already owns that area.

## Local Docker workflow and verification

- Local Madoc is served at `https://madoc.local`.
- Frontend changes should hot-reload from the containerized Vite workflow.
- Dependency install/update commands in this package require a modern Node runtime for pnpm.
- If you hit `ERROR: This version of pnpm requires at least Node.js v18.12` (for example while on `v18.4.0`), switch Node before running pnpm.
- Preferred sequence:
- `source ~/.nvm/nvm.sh`
- `nvm use 22`
- `pnpm --dir services/madoc-ts install` (or `pnpm --dir services/madoc-ts add/remove ...`)
- For backend code changes, always rebuild the relevant Vite server bundle and restart the matching PM2 app:
- Server: `pnpm build:vite-server` then `docker compose exec madoc-ts pm2 restart server`
- Auth: `pnpm build:vite-auth` then `docker compose exec madoc-ts pm2 restart auth`
- Queue/producer: `pnpm build:vite-producer` then `docker compose exec madoc-ts pm2 restart queue`
- Scheduler: `pnpm build:vite-scheduler` then `docker compose exec madoc-ts pm2 restart scheduler`
- If dependencies or container build inputs changed, rebuild containers:
- `docker compose up -d --build`
- Always run a smoke check after changes on `https://madoc.local`.
- If smoke checks need auth you do not have, ask the user for credentials/token or ask them to run the authenticated check.
- If a process fails to come up, verify PM2 state first: `docker compose exec madoc-ts pm2 list`.
- Use targeted logs when needed: `docker compose logs --tail=200 madoc-ts`.

## Agent response style for this repository

- Do not summarize completed changes in bullet points.
- Summarize what changed in 1-2 sentences.
- If user action is required, add a short explicit action list after the summary.

## TypeScript Practice

- Do prefer explicit interfaces/types for gameplay entities
- Do use discriminated unions for complex states
- Do use `type` for unions and simple aliases
- Do use `interface` for object shapes and classes
- Do avoid `any` type (use `unknown` if type is truly unknown)
- Don't use implicit types or `any`

## React & Hooks Best Practices

- Do keep hook signatures focused on a single domain
- Do use `React.memo()` for expensive components
- Do use `useMemo()` and `useCallback()` for expensive calculations
- Do expose imperative handlers via callbacks rather than mutating shared state
- Do memoize expensive computations to align with performance expectations
- Do prefer composition over prop drilling
- Don't mutate state directly
- Don't store derived values in state (calculate on render instead)
