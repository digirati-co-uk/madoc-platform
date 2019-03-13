#!/usr/bin/env bash
set -ex

echo "Wait for containers health"
.scripts/docker/wait-healthy.sh "madoc-platform_omeka-ecosystem"
.scripts/docker/wait-healthy.sh "madoc-platform_mysql"
.scripts/docker/wait-healthy.sh "madoc-platform_annotation-server"
.scripts/docker/wait-healthy.sh "madoc-platform_annotation-database"

# Test homepage
[[ "$(curl -sS "http://localhost:8888/" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]

# Test example site
[[ "$(curl -sS "http://localhost:8888/s/default/page/homepage" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]
