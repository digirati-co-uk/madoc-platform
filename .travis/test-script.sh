#!/usr/bin/env bash
set -ex

echo "=> Wait for Omeka to be available"

MAX_TRIES=30
SECONDS_BETWEEN_CHECKS=5
URL='http://localhost:8888/'

waitForUrl() {
    while [[ ${MAX_TRIES} -gt 0 ]]
    do
      STATUS=$(curl --max-time 1 -s -o /dev/null -w '%{http_code}' ${URL})
      if [[ ${STATUS} -eq 200 ]]; then
        return 0
      else
        MAX_TRIES=$((MAX_TRIES - 1))
      fi
      sleep ${SECONDS_BETWEEN_CHECKS};
    done
    return 1
}


if ! waitForUrl; then
    echo "=> Omeka not available"
    exit 1;
fi;

echo "=> Omeka appears to be available";

# Test homepage
[[ "$(curl -sS "http://localhost:8888/" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]

# Test example site
[[ "$(curl -sS "http://localhost:8888/s/default/page/homepage" --output /dev/null --write-out '%{http_code}' 2>&1)" == "200" ]]
