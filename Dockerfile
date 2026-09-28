# syntax=docker/dockerfile:1.6
FROM node:16-bullseye AS legacy-build
RUN corepack enable

FROM legacy-build AS tasks-build
WORKDIR /build/tasks
COPY services/tasks-api/package.json services/tasks-api/yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive
COPY services/tasks-api/src ./src
COPY services/tasks-api/schemas ./schemas
RUN yarn build-es

FROM legacy-build AS storage-build
WORKDIR /build/storage
COPY services/storage-api/package.json services/storage-api/yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive
COPY services/storage-api/src ./src
RUN yarn build-es

FROM node:22-bullseye AS config-build
WORKDIR /build/config
RUN npm install -g pnpm@9.15.9
COPY services/config-service/package.json services/config-service/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY services/config-service/tsconfig.json ./
COPY services/config-service/src ./src
RUN pnpm build

FROM node:24-bullseye AS madoc-build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /home/node/app
COPY services/madoc-ts/package.json services/madoc-ts/pnpm-lock.yaml services/madoc-ts/pnpm-workspace.yaml ./
COPY services/madoc-ts/npm ./npm
COPY services/madoc-ts/patches ./patches
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY services/madoc-ts/tsconfig*.json ./
COPY services/madoc-ts/src ./src
COPY services/madoc-ts/schemas ./schemas
COPY services/madoc-ts/generate-schemas.js ./
COPY services/madoc-ts/themes ./themes
COPY services/madoc-ts/vite ./vite
COPY services/madoc-ts/vite.config.js services/madoc-ts/postcss.config.js services/madoc-ts/tailwind.config.js ./
ENV NODE_ENV=production
RUN pnpm generate-schema && pnpm build:vite && pnpm build:frontend

FROM node:24-bookworm-slim AS combined
RUN apt-get update && apt-get install -y --no-install-recommends nginx redis-server ca-certificates \
    && mkdir -p /data/redis /var/cache/nginx/asset /var/cache/nginx/media /etc/nginx/conf.d/custom \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pm2@5.4.3
COPY --from=legacy-build /usr/local/bin/node /usr/local/bin/node16

WORKDIR /home/node/app
COPY --from=madoc-build /home/node/app/dist ./dist
COPY --from=madoc-build /home/node/app/node_modules ./node_modules
COPY --from=madoc-build /home/node/app/package.json /home/node/app/pnpm-lock.yaml /home/node/app/pnpm-workspace.yaml ./
COPY services/madoc-ts/ecosystem.config.cjs services/madoc-ts/config.json ./
COPY services/madoc-ts/entrypoint ./entrypoint
COPY services/madoc-ts/migrations ./migrations
COPY services/madoc-ts/schemas ./schemas
COPY services/madoc-ts/service-jwts ./service-jwts
COPY services/madoc-ts/translations ./translations
COPY services/madoc-ts/themes ./themes
COPY services/madoc-ts/npm ./npm
COPY services/madoc-ts/patches ./patches

WORKDIR /opt/services/tasks-api
COPY --from=tasks-build /build/tasks/dist ./dist
COPY --from=tasks-build /build/tasks/node_modules ./node_modules
COPY services/tasks-api/package.json services/tasks-api/config.json ./
COPY services/tasks-api/migrations ./migrations
COPY services/tasks-api/schemas ./schemas

WORKDIR /opt/services/storage-api
COPY --from=storage-build /build/storage/dist ./dist
COPY --from=storage-build /build/storage/node_modules ./node_modules
COPY services/storage-api/package.json ./
RUN mkdir -p files

WORKDIR /opt/services/config-service
COPY --from=config-build /build/config/dist ./dist
COPY --from=config-build /build/config/node_modules ./node_modules
COPY services/config-service/package.json services/config-service/pnpm-lock.yaml ./
COPY services/config-service/configurator ./configurator

COPY deployment/combined/ecosystem.config.cjs /opt/deployment/ecosystem.config.cjs
COPY deployment/combined/nginx.conf /etc/nginx/nginx.conf
COPY deployment/combined/gateway.conf /etc/nginx/conf.d/gateway.conf
COPY deployment/combined/legacy.conf /etc/nginx/conf.d/custom/legacy.conf
COPY services/gateway/conf.d/services /etc/nginx/conf.d/services
COPY services/gateway/www /www
RUN sed -i \
  -e 's/madoc-ts:3000/127.0.0.1:3000/g' \
  -e 's/tasks-api:3000/127.0.0.1:3100/g' \
  -e 's/storage-api:3000/127.0.0.1:3101/g' \
  -e 's/config-service:8000/127.0.0.1:3102/g' \
  /etc/nginx/conf.d/services/*.conf \
  && rm /etc/nginx/conf.d/services/model-api.conf /etc/nginx/conf.d/services/search-api.conf /etc/nginx/conf.d/services/okra-api.conf

WORKDIR /home/node/app
ENV NODE_ENV=production API_GATEWAY=http://127.0.0.1:8080 REDIS_HOST=127.0.0.1 \
    STORAGE_FILE_DIRECTORY=/home/node/app/files
EXPOSE 8080
CMD ["pm2-runtime", "start", "/opt/deployment/ecosystem.config.cjs"]
