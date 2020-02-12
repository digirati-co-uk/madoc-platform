FROM node:10-alpine AS sorting-room

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock

WORKDIR /app

RUN yarn install

COPY ./src /app/src
COPY ./plugins /app/plugins
COPY ./grunt /app/grunt
COPY ./test /app/test
COPY ./Gruntfile.js /app/Gruntfile.js
COPY ./index.html /app/index.html
COPY ./karma.conf.js /app/karma.conf.js
COPY ./.sass-lint.yml /app/.sass-lint.yml
COPY ./.eslintrc /app/.eslintrc

RUN yarn grunt dist

FROM nginx:stable-alpine

COPY --from=sorting-room /app/dist /usr/share/nginx/html
