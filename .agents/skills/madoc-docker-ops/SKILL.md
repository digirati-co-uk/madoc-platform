---
name: madoc-docker-ops
description: Build, run, and debug the Madoc Docker/compose stack with the Docker daemon already running, including rebuilding images, starting/stopping services, inspecting containers/images, and using pm2 inside the madoc-ts container (server/queue/scheduler/auth) plus frontend rebuilds for volume-mounted assets.
---

# Madoc Docker Ops

## Overview

Operate the local Madoc Docker Compose stack, rebuild images when code changes, inspect running containers/images, and use pm2 inside `madoc-ts` to debug processes and logs.

## Compose Map (docker-compose.yml)

Services you will interact with most often:

- `gateway`
- `madoc-ts`
- `madoc-ts-vite`
- `shared-postgres`
- `gateway-redis`
- `tasks-api`
- `model-api`
- `config-service`
- `storage-api`
- `search`
- `okra`

Also check `docker-compose.test.yml` when dealing with test-only services or overrides.

## Quick Start

1. Start the full stack: `docker compose up -d`.
2. Verify health: `docker compose ps` and `docker compose logs -f madoc-ts`.
3. If only a subset is needed, bring up specific services: `docker compose up -d madoc-ts madoc-ts-vite shared-postgres gateway`.

## Build & Rebuild Images (Volume-Mounted)

- Rebuild development frontend bundle: `pnpm build:vite-server` run outside of docker since its a volume
- Rebuild selected services: `docker compose build madoc-ts madoc-ts-vite`.
- Force a clean rebuild: `docker compose build --no-cache madoc-ts`.
- Rebuild and restart in one step: `docker compose up -d --build madoc-ts`.

## Frontend Rebuild

The frontend assets are bind-mounted, so rebuilds must be triggered even when containers are already running. However there is a vite server
so during development frontend ONLY fixes should be fine.

- Rebuild production frontend bundle: `docker compose exec madoc-ts pnpm run build:frontend`.
- Rebuild server-side bundles: `docker compose exec madoc-ts pnpm run build:vite`.
- Vite dev server is provided by `madoc-ts-vite` (ports 3088/3089); restart it if needed: `docker compose restart madoc-ts-vite`.

## Container & Image Inspection

- List running containers: `docker ps`.
- List compose containers: `docker compose ps`.
- List images: `docker images` or `docker compose images`.
- Inspect a container: `docker inspect <container>`.
- Check mounted volumes: `docker inspect <container> | rg -n "Mounts"`.

## Logs & Debugging

- Follow logs for a service: `docker compose logs -f madoc-ts`.
- Last 200 lines: `docker compose logs --tail=200 madoc-ts`.
- Single container logs: `docker logs -f <container>`.

## PM2 Inside `madoc-ts`

`madoc-ts` runs `pnpm dev`, which launches pm2 with `ecosystem.config.cjs`.
Processes: `server`, `queue`, `scheduler`, `auth`.

Common commands:

- Status: `docker compose exec madoc-ts pm2 status`.
- Logs: `docker compose exec madoc-ts pm2 logs`.
- Logs for one app: `docker compose exec madoc-ts pm2 logs server`.
- Restart a process: `docker compose exec madoc-ts pm2 restart server`.
- Reload all: `docker compose exec madoc-ts pm2 reload all`.

## Stop / Clean Up

- Stop everything: `docker compose down`.
- Stop and remove volumes: `docker compose down -v`.
- Remove unused images: `docker image prune`.

## Troubleshooting Checks

- Confirm Docker daemon is reachable: `docker info`.
- Verify env-driven ports and settings in `docker-compose.yml`.
- If pm2 is unresponsive, restart the service: `docker compose restart madoc-ts`.
- If frontend updates do not appear, rerun `pnpm run build:frontend` inside the container.
- If you want to check if the server is working, here's a quick command you can use: `curl -sk https://madoc.local/ | grep "Something went wrong."`
