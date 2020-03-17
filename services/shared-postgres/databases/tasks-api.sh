#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-"EOSQL"
	CREATE USER tasks_api WITH ENCRYPTED PASSWORD 'tasks_api_password';
  CREATE DATABASE tasks_api;
  GRANT ALL PRIVILEGES ON DATABASE tasks_api TO tasks_api;
EOSQL
