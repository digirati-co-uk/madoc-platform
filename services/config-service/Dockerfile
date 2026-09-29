# syntax=docker/dockerfile:1.6
FROM node:24-alpine AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches ./patches
COPY services/madoc-ts/package.json ./services/madoc-ts/package.json
COPY services/madoc-ts/npm ./services/madoc-ts/npm
COPY services/config-service/package.json ./services/config-service/package.json
COPY services/tasks-api/package.json ./services/tasks-api/package.json
COPY services/storage-api/package.json ./services/storage-api/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter config-service --frozen-lockfile
COPY services/config-service/src ./services/config-service/src
COPY services/config-service/tsconfig.json ./services/config-service/tsconfig.json
COPY services/config-service/configurator ./services/config-service/configurator
RUN pnpm --filter config-service build

FROM node:24-alpine
ENV NODE_ENV=production PORT=8000
COPY --from=build /workspace /workspace
WORKDIR /workspace/services/config-service
EXPOSE 8000
CMD ["node", "dist/index.js"]
