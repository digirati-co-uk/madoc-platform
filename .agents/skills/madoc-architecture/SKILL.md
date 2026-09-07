---
name: madoc-architecture
description: Madoc process startup, global middleware order, and runtime/build configuration. Applies to boot failures or application composition changes; individual routes and React rendering belong to their subsystem skills.
---

# Madoc Architecture

## Locate the process

Follow `ecosystem.config.cjs` -> `entrypoint/*.cjs` -> the matching bundle and Vite source entrypoint. PM2 names are `server`, `auth`, `queue`, and `scheduler`; the queue bundle is named `producer`.

- HTTP composition: `src/server.ts`, `src/app.ts`, `src/router.ts`
- Configuration and runtime paths: `src/config.ts`, `src/paths.ts`, `config.json`
- Build inputs: `vite/`, `entrypoint/`
- HTTP-to-SSR bridges: `src/routes/frontend/`

## Constraints

- Check both entry and unwind order around Koa's `await next()`. Cookie issuance and API disposal wrap route execution; static pages can bypass it. The middleware contract is in `AGENTS.md`.
- Keep configuration in the existing config/path layer. Verify new runtime files are copied into the final Docker image.
- Do not attach long-lived PM2 bus listeners to the imported singleton: status requests call `pm2.disconnect()`. Use an isolated PM2 client or child process and clean it up when the request closes.
- Server instances share external state. Cron registration in `src/app.ts` is gated to `NODE_APP_INSTANCE === '0'`; preserve that gate to avoid duplicate jobs.

## Verify

Use the affected process build/restart from `AGENTS.md`, confirm PM2 is online, and exercise the affected entrypoint. Check each affected site/admin/account bridge if changing shared SSR composition.
