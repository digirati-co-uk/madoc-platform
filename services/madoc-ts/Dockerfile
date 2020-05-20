FROM node:12 as build

WORKDIR /home/node/app

ADD ./package.json /home/node/app/package.json

RUN yarn install

COPY ./src /home/node/app/src
COPY ./schemas /home/node/app/schemas
COPY ./webpack.frontend.js /home/node/app/webpack.frontend.js
COPY ./tsconfig.json /home/node/app/tsconfig.json
COPY ./generate-schemas.js /home/node/app/generate-schemas.js

RUN yarn build

FROM node:12-alpine

WORKDIR /home/node/app

RUN npm install -g pm2

COPY --from=build /home/node/app/lib /home/node/app/lib
COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY ./schemas /home/node/app/schemas
COPY ./webpack.frontend.js /home/node/app/webpack.frontend.js
COPY ./ecosystem.config.js /home/node/app/ecosystem.config.js

RUN yarn install --no-interactive --frozen-lockfile

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

RUN mkdir -p /home/node/app/service-jwt && \
    mkdir -p /home/node/app/service-jwt-responses && \
    chown node:node /home/node/app/service-jwt && \
    chown node:node /home/node/app/service-jwt-responses

USER node

COPY ./migrate.js /home/node/app/migrate.js
COPY ./migrations /home/node/app/migrations
COPY ./service-jwts /home/node/app/service-jwts
COPY ./config.json /home/node/app/config.json
COPY ./translations /home/node/app/translations
COPY ./schemas /home/node/app/schemas
COPY ./generate-schemas.js /home/node/app/generate-schemas.js

CMD ["pm2-runtime", "start", "./ecosystem.config.js"]

