#!/bin/bash
set -e

source /usr/local/bin/docker-entrypoint.sh

if [ "$1" = 'postgres' ]; then
    docker_setup_env

    chown -R postgres "$PGDATA"

    if [ -z "$(ls -A "$PGDATA")" ]; then
        gosu postgres initdb
    fi

    if [ "$(id -u)" = '0' ]; then
      # then restart script as postgres user
      exec gosu postgres "$BASH_SOURCE" "$@"
    fi

    pg_setup_hba_conf

    docker_temp_server_start

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-"EOSQL"

SELECT 'CREATE DATABASE tasks_api'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tasks_api')\gexec

DO $$
BEGIN
  CREATE ROLE tasks_api LOGIN PASSWORD 'tasks_api_password';
  GRANT ALL PRIVILEGES ON DATABASE tasks_api TO tasks_api;

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role my_role -- it already exists';
END
$$;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-"EOSQL"

SELECT 'CREATE DATABASE model_api'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'model_api')\gexec

DO $$
BEGIN
  CREATE ROLE model_api LOGIN PASSWORD 'model_api_password';
  GRANT ALL PRIVILEGES ON DATABASE model_api TO model_api;

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role my_role -- it already exists';
END
$$;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d model_api <<-"EOSQL"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

EOSQL

    docker_temp_server_stop
fi

exec "$@"
