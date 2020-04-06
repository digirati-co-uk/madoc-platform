#!/usr/bin/env bash

set -ex

echo "Waiting for public key."
while read i; do if [ "$i" = /openssl-certs/madoc.pub ]; then break; fi; done \
   < <(inotifywait  -e create,open --format '%f' --quiet /tmp --monitor)

JWT_SOURCE_64=$(base64 < /openssl-certs/madoc.pub);

IFS=',' read -ra ADDR <<< "$JWT_SERVICES"
for i in "${ADDR[@]}"; do

  jq --arg value "$JWT_SOURCE_64" '.jwt_source = $value' <"apps/$i.json" >"apps/$i.new.json"

  cat "apps/$i.new.json"

  if [ $? -eq 0 ]; then
     mv "apps/$i.new.json" "apps/$i.json";
  fi

done


exec ./entrypoint.sh
