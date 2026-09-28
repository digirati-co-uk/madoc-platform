# syntax=docker/dockerfile:1.6
FROM node:24-bullseye AS build
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches ./patches
COPY services/madoc-ts/package.json ./services/madoc-ts/package.json
COPY services/madoc-ts/npm ./services/madoc-ts/npm
COPY services/config-service/package.json ./services/config-service/package.json
COPY services/tasks-api/package.json ./services/tasks-api/package.json
COPY services/storage-api/package.json ./services/storage-api/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --filter madoc-ts --frozen-lockfile
COPY services/madoc-ts ./services/madoc-ts
ENV NODE_ENV=production
RUN pnpm --filter madoc-ts generate-schema \
 && pnpm --filter madoc-ts build:vite \
 && pnpm --filter madoc-ts build:frontend

FROM node:24-bookworm-slim
ARG BUILD_TIME=unknown
ARG BUILD_VERSION=unknown
ARG BUILD_REVISION=unknown
RUN npm install -g pm2@5.4.3
COPY --from=build /workspace /workspace
RUN mkdir -p /home/node \
 && ln -s /workspace/services/madoc-ts /home/node/app \
 && mkdir -p /workspace/services/madoc-ts/service-jwt \
             /workspace/services/madoc-ts/service-jwt-responses \
             /workspace/services/madoc-ts/files \
             /workspace/services/madoc-ts/openssl-certs \
 && chown -R node:node /workspace/services/madoc-ts/service-jwt \
                        /workspace/services/madoc-ts/service-jwt-responses \
                        /workspace/services/madoc-ts/files \
                        /workspace/services/madoc-ts/openssl-certs
WORKDIR /home/node/app
ENV SERVER_PORT=3000 DATABASE_HOST=localhost DATABASE_NAME=postgres DATABASE_PORT=5400 \
    DATABASE_USER=postgres DATABASE_SCHEMA=public DATABASE_PASSWORD=postgres \
    NODE_ENV=production API_GATEWAY_HOST=http://gateway \
    BUILD_TIME=${BUILD_TIME} BUILD_VERSION=${BUILD_VERSION} BUILD_REVISION=${BUILD_REVISION}
EXPOSE 3000 3001
USER node
CMD ["pm2-runtime", "start", "./ecosystem.config.cjs"]
