#!/usr/bin/env bash

mkdir -p ./dist
docker build -t madoc-sorting-room .
docker run --name madoc-sorting-room --rm -d madoc-sorting-room
docker cp madoc-sorting-room:/usr/share/nginx/html ./
docker stop madoc-sorting-room
