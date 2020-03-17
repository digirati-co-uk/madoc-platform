#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-"EOSQL"
	CREATE USER model_api WITH ENCRYPTED PASSWORD 'model_api_passowrd';
  CREATE DATABASE model_api;
  GRANT ALL PRIVILEGES ON DATABASE model_api TO model_api;
EOSQL
