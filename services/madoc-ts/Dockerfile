FROM node:14 as build

WORKDIR /home/node/app

ADD ./package.json /home/node/app/package.json
ADD ./yarn.lock /home/node/app/yarn.lock
COPY ./npm /home/node/app/npm

RUN yarn install

COPY ./src /home/node/app/src
COPY ./schemas /home/node/app/schemas
COPY ./webpack.config.js /home/node/app/webpack.config.js
COPY ./tsconfig.json /home/node/app/tsconfig.json
COPY ./tsconfig.frontend.json /home/node/app/tsconfig.frontend.json
COPY ./generate-schemas.js /home/node/app/generate-schemas.js
ADD ./themes /home/node/app/themes

ENV NODE_ENV=production

RUN yarn build

FROM node:14 as modules

WORKDIR /home/node/app

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY --from=build /home/node/app/npm /home/node/app/npm

RUN yarn install --no-interactive --frozen-lockfile --production=true

FROM node:14

WORKDIR /home/node/app

RUN npm install -g pm2@4.5.6

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY --from=modules /home/node/app/node_modules /home/node/app/node_modules
COPY --from=build /home/node/app/lib /home/node/app/lib
COPY ./schemas /home/node/app/schemas
COPY ./webpack.config.js /home/node/app/webpack.config.js
COPY ./ecosystem.config.js /home/node/app/ecosystem.config.js
COPY ./themes /home/node/app/themes
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

COPY ./migrate.js /home/node/app/migrate.js
COPY ./migrations /home/node/app/migrations
COPY ./service-jwts /home/node/app/service-jwts
COPY ./config.json /home/node/app/config.json
COPY ./translations /home/node/app/translations
COPY ./schemas /home/node/app/schemas
COPY ./generate-schemas.js /home/node/app/generate-schemas.js

CMD ["pm2-runtime", "start", "./ecosystem.config.js"]

