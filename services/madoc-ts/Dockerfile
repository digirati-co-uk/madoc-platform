FROM node:12 as build

WORKDIR /home/node/app

ADD ./package.json /home/node/app/package.json

RUN yarn install

COPY ./src /home/node/app/src
COPY ./schemas /home/node/app/schemas
COPY ./tsconfig.json /home/node/app/tsconfig.json

RUN yarn build

FROM node:12-alpine

WORKDIR /home/node/app

RUN npm install -g pm2

COPY --from=build /home/node/app/lib /home/node/app/lib
COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY ./schemas /home/node/app/schemas
COPY ./ecosystem.config.js /home/node/app/ecosystem.config.js

RUN yarn install --no-interactive --frozen-lockfile

ENV SERVER_PORT=3000
ENV DATABASE_HOST=localhost
ENV DATABASE_NAME=postgres
ENV DATABASE_PORT=5400
ENV DATABASE_USER=postgres
ENV DATABASE_SCHEMA=public
ENV DATABASE_PASSWORD=postgres

EXPOSE 3000

USER node

COPY ./migrate.js /home/node/app/migrate.js
COPY ./migrations /home/node/app/migrations

CMD ["pm2-runtime", "start", "./ecosystem.config.js", "--only", "tasks-api-prod"]

