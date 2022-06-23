FROM node:18 as build

WORKDIR /home/node/app

COPY ./package.json /home/node/app/package.json
COPY ./yarn.lock /home/node/app/yarn.lock
COPY ./npm /home/node/app/npm

RUN yarn install --no-interactive --frozen-lockfile

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

ENV NODE_ENV=production

RUN yarn generate-schema
RUN yarn build:vite-producer
RUN yarn build:vite-auth
RUN yarn build:vite-scheduler
RUN yarn build:frontend
RUN yarn build:vite-server

FROM node:18 as modules

WORKDIR /home/node/app

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY --from=build /home/node/app/npm /home/node/app/npm

RUN yarn install --no-interactive --frozen-lockfile --production=true

FROM node:18

WORKDIR /home/node/app

RUN npm install -g pm2@5

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
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

