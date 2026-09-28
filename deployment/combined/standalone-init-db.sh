#!/usr/bin/env bash
set -Eeuo pipefail

# Only invoked by the official PostgreSQL entrypoint on a fresh standalone volume.
for service in MADOC_TS TASKS_API MODELS_API CONFIG_SERVICE SEARCH_API; do
  user_name="POSTGRES_${service}_USER"
  password_name="POSTGRES_${service}_PASSWORD"
  schema_name="POSTGRES_${service}_SCHEMA"
  role="${!user_name}"
  password="${!password_name}"
  schema="${!schema_name}"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -v role="$role" -v password="$password" -v schema="$schema" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'role', :'password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'role') \gexec
SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', current_database(), :'role') \gexec
SELECT format('CREATE SCHEMA IF NOT EXISTS %I AUTHORIZATION %I', :'schema', :'role') \gexec
SELECT format('ALTER ROLE %I SET search_path TO %I, public', :'role', :'schema') \gexec
SQL
done

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS ltree;
SQL
