#!/usr/bin/env bash
set -ex

echo "Wait for containers health"
.scripts/docker/wait-healthy.sh "madocplatform_omeka-ecosystem"
.scripts/docker/wait-healthy.sh "madocplatform_mysql"
.scripts/docker/wait-healthy.sh "madocplatform_annotation-server"
.scripts/docker/wait-healthy.sh "madocplatform_annotation-database"

# Test homepage
[[ "$(curl -sS "http://localhost:8888/" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]

# Test example site
[[ "$(curl -sS "http://localhost:8888/s/default/page/homepage" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]
