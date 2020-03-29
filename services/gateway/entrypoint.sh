#!/usr/bin/env bash

set -ex

JWT_SOURCE_64=$(base64 < /openssl-certs/madoc.pub);

IFS=',' read -ra ADDR <<< "$JWT_SERVICES"
for i in "${ADDR[@]}"; do
    echo $(cat "./apps/$i.json" | jq --arg value "$JWT_SOURCE_64" '.jwt_source = $value') > "./apps/$i.json"
done


./entrypoint.sh
