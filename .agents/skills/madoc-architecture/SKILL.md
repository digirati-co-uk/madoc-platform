---
name: madoc-architecture
description: Trace or change Madoc TS startup, application composition, middleware ordering, runtime configuration, process entrypoints, and top-level SSR wiring. Use for boot failures, new global middleware or services, entrypoint changes, and configuration that affects services/madoc-ts as a whole.
---

# Madoc Architecture

Read the repository `AGENTS.md` first; it owns the cross-cutting runtime and verification rules.

## Trace the process

1. Identify the PM2 process: `server`, `auth`, `queue`, or `scheduler`.
2. Follow `services/madoc-ts/entrypoint/*.cjs` to its bundle under `dist/` and then to the matching source entrypoint.
3. For the HTTP server, trace `src/server.ts` -> `src/app.ts` -> `src/router.ts`.
4. Read neighbouring middleware and registrations before changing order or shared context.

## Source map

- Application and middleware composition: `src/app.ts`
- Typed route table: `src/router.ts`
- Server construction: `src/server.ts`
- Runtime paths and configuration: `src/paths.ts`, `src/config.ts`, `config.json`
- PM2 definitions: `ecosystem.config.cjs`
- Build entrypoints: `entrypoint/`, `vite/`
- Site/admin/account HTTP-to-SSR bridge: `src/routes/frontend/`

## Guardrails

- Treat middleware order as behavior. Check auth, site state, static-page handling, and disposal before inserting anything.
- Keep configuration in the existing config/path layer; do not add a second env parser.
- When a new runtime file is required, verify the Docker build copies it into the final image.
- Use the process-specific rebuild and restart command from `AGENTS.md`, then smoke-test `https://madoc.local`.

## Check

Run the narrowest process build, confirm PM2 reports the process online, and request one affected route. For SSR composition changes, check each affected site, admin, and account surface.
