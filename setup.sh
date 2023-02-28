#!/usr/bin/env bash

set -e

## var
mkdir -p -m 777 var
mkdir -p -m 777 var/certs

## Installer.
(cd ./services/madoc-ts && yarn install --frozen-lockfile);
(cd ./services/madoc-ts && yarn build);


## Certs
mkcert -install -cert-file var/certs/local-cert.pem -key-file var/certs/local-key.pem madoc.local

## Docker
docker-compose build;

## Validate certs
echo "First run";
echo "   docker-compose up -d"
echo "";
echo "Then: "
echo " - Open https://madoc.local/ in browsers you will test with, and accept the certificate";
echo " - Open https://madoc.local:3088/ in browsers you will test with, and accept the certificate";
