# syntax=docker/dockerfile:1.6
FROM node:24-bullseye AS build
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY patches ./patches
COPY services/madoc-ts/package.json ./services/madoc-ts/package.json
COPY services/madoc-ts/npm ./services/madoc-ts/npm
COPY services/config-service/package.json ./services/config-service/package.json
COPY services/tasks-api/package.json ./services/tasks-api/package.json
COPY services/storage-api/package.json ./services/storage-api/package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY services/madoc-ts ./services/madoc-ts
COPY services/config-service ./services/config-service
COPY services/tasks-api ./services/tasks-api
COPY services/storage-api ./services/storage-api
ENV NODE_ENV=production
RUN pnpm build

FROM node:24-bookworm-slim AS combined
RUN apt-get update && apt-get install -y --no-install-recommends nginx redis-server ca-certificates \
    && mkdir -p /data/redis /var/cache/nginx/asset /var/cache/nginx/media /etc/nginx/conf.d/custom \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pm2@5.4.3
COPY --from=node:16-bullseye /usr/local/bin/node /usr/local/bin/node16
COPY --from=build /workspace /workspace
RUN mkdir -p /home/node /opt/services \
 && ln -s /workspace/services/madoc-ts /home/node/app \
 && ln -s /workspace/services/tasks-api /opt/services/tasks-api \
 && ln -s /workspace/services/storage-api /opt/services/storage-api \
 && ln -s /workspace/services/config-service /opt/services/config-service \
 && mkdir -p /workspace/services/storage-api/files
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
