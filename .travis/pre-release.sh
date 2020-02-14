#!/usr/bin/env bash

# Next version from input
NEXT_VERSION=$1;shift;

# Create short commit hash for tagging.
COMMIT_HASH="$(git rev-parse --short HEAD)"

echo "Updating dependencies...";

docker pull digirati/madoc-omeka-s:latest

echo "Building v$NEXT_VERSION-$COMMIT_HASH";

# Build.
docker build -t madoc-platform-prerelease services/madoc

# Tag.
docker tag madoc-platform-prerelease:latest digirati/madoc-platform:v"$NEXT_VERSION"-"$COMMIT_HASH"
echo -e
echo -e "Successfully created and tagged: digirati/madoc-platform:v$NEXT_VERSION-$COMMIT_HASH";
echo -e
echo -e "  To push run:"
echo -e "  $ docker push digirati/madoc-platform:v$NEXT_VERSION-$COMMIT_HASH"
echo -e
