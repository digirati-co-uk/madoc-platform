---
name: configuration-deployment
description: Work on Madoc TS runtime configuration, path conventions, and Docker build/runtime setup. Use when adjusting env vars, file paths, or Docker build steps in services/madoc-ts.
---

# Configuration & Deployment (Madoc TS)

## Overview
Describe how runtime paths are resolved, which environment variables drive behavior, and how Docker images are built and run.

## Key Entry Points
- Path constants: `services/madoc-ts/src/paths.ts`
- Docker build: `services/madoc-ts/Dockerfile`
- Runtime config: `services/madoc-ts/config.json`
- Process config: `services/madoc-ts/ecosystem.config.cjs`
- Entry scripts: `services/madoc-ts/entrypoint/`

## Configuration Summary (Based on Source)
- `ROOT_PATH` defaults to `/home/node/app` (overridable by `MADOC_ROOT_PATH`).
- File paths for schemas, translations, themes, storage, and JWT folders derive from `ROOT_PATH` and env vars.
- HTML templates for SSR are loaded from `dist/frontend-site/src/site.html` and `dist/frontend-site/src/admin.html`.

## Docker Build Summary (Based on Source)
- Multi-stage build:
  - Build stage uses pnpm to build schemas, Vite bundles, and server artifacts.
  - Modules stage installs production dependencies.
  - Final stage copies `dist`, migrations, schemas, themes, translations, and config.
- Runtime defaults expose ports `3000` and `3001` and set DB env defaults.

## Quick Start Workflow
1. For path changes, update `src/paths.ts` and confirm any env overrides.
2. For build changes, update `Dockerfile` stages and ensure required assets are copied.
3. For runtime defaults, update `config.json` or `ecosystem.config.cjs` as needed.

## Common Tasks
- Add a new asset path or env override
- Update Docker build steps for new bundles
- Ensure runtime includes new static assets or schemas

## Pitfalls
- Adding new assets without copying them into the final Docker image
- Changing path constants without updating dependent code
- Forgetting to update `config.json` defaults for new features

## Suggested Checks
- Build Docker image and verify assets exist in `/home/node/app`
- Start container and confirm SSR templates load
