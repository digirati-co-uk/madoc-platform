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


## Model api
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
DO \$\$
BEGIN
  RAISE NOTICE 'adding new user $POSTGRES_MODELS_API_USER';
  CREATE ROLE $POSTGRES_MODELS_API_USER LOGIN PASSWORD '$POSTGRES_MODELS_API_PASSWORD';

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role $POSTGRES_MODELS_API_USER -- it already exists';
END
\$\$;

CREATE SCHEMA IF NOT EXISTS $POSTGRES_MODELS_API_SCHEMA AUTHORIZATION $POSTGRES_MODELS_API_USER;
EOSQL

## Tasks API.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
DO \$\$
BEGIN
  CREATE ROLE $POSTGRES_TASKS_API_USER LOGIN PASSWORD '$POSTGRES_TASKS_API_PASSWORD';

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role $POSTGRES_TASKS_API_USER -- it already exists';
END
\$\$;

CREATE SCHEMA IF NOT EXISTS $POSTGRES_TASKS_API_SCHEMA AUTHORIZATION $POSTGRES_TASKS_API_USER;
EOSQL

## Config Service Database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
DO \$\$
BEGIN
  CREATE ROLE $POSTGRES_CONFIG_SERVICE_USER LOGIN PASSWORD '$POSTGRES_CONFIG_SERVICE_PASSWORD';

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role $POSTGRES_CONFIG_SERVICE_USER -- it already exists';
END
\$\$;

CREATE SCHEMA IF NOT EXISTS $POSTGRES_CONFIG_SERVICE_SCHEMA AUTHORIZATION $POSTGRES_CONFIG_SERVICE_USER;
EOSQL

## Madoc TS database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
DO \$\$
BEGIN
  CREATE ROLE $POSTGRES_MADOC_TS_USER LOGIN PASSWORD '$POSTGRES_MADOC_TS_PASSWORD';

  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role $POSTGRES_MADOC_TS_USER -- it already exists';
END
\$\$;

CREATE SCHEMA IF NOT EXISTS $POSTGRES_MADOC_TS_SCHEMA AUTHORIZATION $POSTGRES_MADOC_TS_USER;
EOSQL


## Extensions

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d model_api <<-"EOSQL"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d madoc <<-"EOSQL"

CREATE EXTENSION IF NOT EXISTS "ltree";

EOSQL


    docker_temp_server_stop
fi

exec "$@"
