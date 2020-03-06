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

RUN npm install -g nodemon

COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/lib /home/node/app/lib
COPY ./nodemon.prod.json /home/node/app/nodemon.json
COPY ./schemas /home/node/app/schemas

RUN yarn install --no-dev

ENV SERVER_PORT=3000
ENV DATABASE_HOST=localhost
ENV DATABASE_NAME=tasks_api
ENV DATABASE_PORT=5400
ENV DATABASE_USER=tasks_api
ENV DATABASE_SCHEMA=public
ENV DATABASE_PASSWORD=tasks_api_password

EXPOSE 3000

USER node

COPY ./startup.sh /home/node/app/startup.sh
COPY ./migrate.js /home/node/app/migrate.js
COPY ./migrations /home/node/app/migrations

CMD ["./startup.sh"]

