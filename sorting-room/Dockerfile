FROM  digirati/node8-npm5-alpine37

COPY . /srv/sorting-room

WORKDIR /srv/sorting-room

RUN apk add --no-cache yarn && npm install -g grunt-cli http-server --unsafe-perm && yarn && grunt dist

CMD sh ./makeConfig.sh && http-server ./dist -p 3000