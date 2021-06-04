FROM node:12 as build

WORKDIR /home/node/app

ADD ./package.json /home/node/app/package.json

RUN yarn install

COPY ./src /home/node/app/src
COPY ./tsconfig.json /home/node/app/tsconfig.json

RUN yarn build

FROM node:12-alpine

WORKDIR /home/node/app

RUN npm install -g pm2@4

COPY --from=build /home/node/app/lib /home/node/app/lib
COPY --from=build /home/node/app/package.json /home/node/app/package.json
COPY --from=build /home/node/app/yarn.lock /home/node/app/yarn.lock
COPY ./ecosystem.config.js /home/node/app/ecosystem.config.js

RUN yarn install --no-dev --no-interactive --frozen-lockfile

ENV SERVER_PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

USER node

CMD ["pm2-runtime", "start", "./ecosystem.config.js"]

