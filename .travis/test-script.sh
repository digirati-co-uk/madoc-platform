#!/usr/bin/env bash
set -ex

# Test homepage
[[ "$(curl -sS "http://localhost:8888/" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]

# Test example site
[[ "$(curl -sS "http://localhost:8888/s/default/page/homepage" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]

# Test Madoc TS.
[[ "$(curl -sS "http://localhost:8888/s/default/madoc/login" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]
