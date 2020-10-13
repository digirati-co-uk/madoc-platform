#!/bin/bash

set -e

FILES=/docker-entrypoint-initdb.d/*
for f in $FILES
do
  echo "Restoring $f"
  /usr/bin/mysql -u omeka_s --password=Password123 omeka_s < "$f"
done
