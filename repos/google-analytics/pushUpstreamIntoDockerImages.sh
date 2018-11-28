#!/bin/bash

 if [[ "$TRAVIS_BRANCH" = "master" ]] && [[ "$TRAVIS_PULL_REQUEST" = "false" ]]; then

    body='{
    "request": {
    "branch":"master"
    }}'

    echo -e "\033[00;32m ===> Pushing this change upstream into the rs-build \033[0m\n";

    curl -s -X POST -H "Content-Type: application/json" -H "Accept: application/json" -H "Travis-API-Version: 3" -H "Authorization: token ${TRAVIS_ACCESS_TOKEN}" -d "$body" https://api.travis-ci.com/repo/digirati-co-uk%2Frs-omeka-build/requests

    echo -e "\033[00;32m====================S=U=C=C=E=S=S=======================\033[0m\n";
    
    echo -e "\033[00;32m ===> Pushing this change upstream into the ida-build \033[0m\n";

    curl -s -X POST -H "Content-Type: application/json" -H "Accept: application/json" -H "Travis-API-Version: 3" -H "Authorization: token ${TRAVIS_ACCESS_TOKEN}" -d "$body" https://api.travis-ci.com/repo/digirati-co-uk%2Fida-omeka-build/requests

    echo -e "\033[00;32m====================S=U=C=C=E=S=S=======================\033[0m\n";

 fi
