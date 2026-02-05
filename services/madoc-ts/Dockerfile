# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bullseye as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base as build

WORKDIR /home/node/app

COPY ./package.json /home/node/app/package.json
COPY ./pnpm-lock.yaml /home/node/app/pnpm-lock.yaml
COPY ./npm /home/node/app/npm

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

# These may not be required.
COPY ./tsconfig.json /home/node/app/tsconfig.json
COPY ./tsconfig.frontend.json /home/node/app/tsconfig.frontend.json

# These are required
COPY ./src /home/node/app/src
COPY ./schemas /home/node/app/schemas
COPY ./generate-schemas.js /home/node/app/generate-schemas.js
COPY ./themes /home/node/app/themes
COPY ./vite /home/node/app/vite
COPY ./vite.config.js /home/node/app/vite.config.js
COPY ./postcss.config.js /home/node/app/postcss.config.js
COPY ./tailwind.config.js /home/node/app/tailwind.config.js

ENV NODE_ENV=production

RUN pnpm run generate-schema
RUN pnpm run build:vite-producer
RUN pnpm run build:vite-auth
RUN pnpm run build:vite-scheduler
RUN pnpm run build:frontend
RUN pnpm run build:vite-server

FROM base as modules

WORKDIR /home/node/app

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/pnpm-lock.yaml /home/node/app/pnpm-lock.yaml
COPY --from=build /home/node/app/npm /home/node/app/npm

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM node:${NODE_VERSION}-slim

ARG BUILD_TIME='unknown'
ARG BUILD_VERSION='unknown'
ARG BUILD_REVISION='unknown'

WORKDIR /home/node/app

RUN npm install -g pm2@5.4

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=modules /home/node/app/node_modules /home/node/app/node_modules
COPY --from=build /home/node/app/dist /home/node/app/dist
COPY ./ecosystem.config.cjs /home/node/app/ecosystem.config.cjs
COPY ./npm /home/node/app/npm

ENV SERVER_PORT=3000
ENV DATABASE_HOST=localhost
ENV DATABASE_NAME=postgres
ENV DATABASE_PORT=5400
ENV DATABASE_USER=postgres
ENV DATABASE_SCHEMA=public
ENV DATABASE_PASSWORD=postgres
ENV NODE_ENV=production
ENV API_GATEWAY_HOST=http://gateway

ENV BUILD_TIME=${BUILD_TIME}
ENV BUILD_VERSION=${BUILD_VERSION}
ENV BUILD_REVISION=${BUILD_REVISION}

EXPOSE 3000
EXPOSE 3001

RUN mkdir -p /home/node/app/service-jwt && \
    mkdir -p /home/node/app/service-jwt-responses && \
    mkdir -p /home/node/app/files && \
    mkdir -p /home/node/app/openssl-certs && \
    chown node:node /home/node/app/service-jwt && \
    chown node:node /home/node/app/service-jwt-responses && \
    chown node:node /home/node/app/files && \
    chown node:node /home/node/app/openssl-certs

USER node

COPY ./migrations /home/node/app/migrations
COPY ./service-jwts /home/node/app/service-jwts
COPY ./config.json /home/node/app/config.json
COPY ./translations /home/node/app/translations
COPY ./themes /home/node/app/themes
COPY ./schemas /home/node/app/schemas
COPY ./entrypoint /home/node/app/entrypoint

CMD ["pm2-runtime", "start", "./ecosystem.config.cjs"]
