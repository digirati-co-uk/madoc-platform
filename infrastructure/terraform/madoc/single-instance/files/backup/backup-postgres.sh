#! /bin/bash

# config-service
/usr/bin/pg_dump --dbname=postgres://config_service:config_service_password@0.0.0.0/config_service > config_service.sql
/bin/chmod 644 config_service.sql

# model-api
/usr/bin/pg_dump --dbname=postgres://model_api:model_api_password@0.0.0.0/model_api > model_api.sql
/bin/chmod 644 model_api.sql

# madoc
/usr/bin/pg_dump --dbname=postgres://madoc:madoc_password@0.0.0.0/madoc > madoc.sql
/bin/chmod 644 madoc.sql

# tasks-api
/usr/bin/pg_dump --dbname=postgres://tasks_api:tasks_api_password@0.0.0.0/tasks_api > tasks_api.sql
/bin/chmod 644 tasks_api.sql
