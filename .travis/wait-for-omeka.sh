#!/usr/bin/env bash
set -ex

echo "=> Wait for Omeka to be available"

MAX_TRIES=30
SECONDS_BETWEEN_CHECKS=5

waitForUrl() {
    while [[ ${MAX_TRIES} -gt 0 ]]
    do
      STATUS=$(curl -sS "http://localhost:8888/" --output /dev/null --write-out '%{http_code}' 2>&1)
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
