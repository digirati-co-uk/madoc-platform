#!/usr/bin/env bash

if [[ "$(docker images -q digirati/madoc-omeka-s:latest 2> /dev/null)" == "" ]]; then
  echo -e "\033[00;32m ===> Image was NOT built, failing the build";
  exit 1
fi

if [[ "$TRAVIS_BRANCH" = "master" ]] && [[ "$TRAVIS_PULL_REQUEST" = "false" ]]; then
  # @todo add extra tags here.
  docker push digirati/madoc-omeka-s:latest
fi
