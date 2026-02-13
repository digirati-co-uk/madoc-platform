#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/madoc-platform

git config --global --add safe.directory /workspaces/madoc-platform

corepack enable
corepack prepare pnpm@9.15.9 --activate

mkdir -p var/certs var/files var/jwt var/shared-database var/typesense

pnpm --dir services/madoc-ts install --frozen-lockfile
pnpm --dir services/config-service install --frozen-lockfile

if command -v mkcert >/dev/null 2>&1 && [ ! -f var/certs/local-cert.pem ]; then
  ./create-certs.sh || true
fi
