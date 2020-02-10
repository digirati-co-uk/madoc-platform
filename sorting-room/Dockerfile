FROM node:10-alpine AS build

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install

COPY . /app

RUN yarn grunt dist

CMD sh ./makeConfig.sh && npx http-server ./dist -p 3000
