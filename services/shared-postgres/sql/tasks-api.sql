CREATE USER tasks_api WITH ENCRYPTED PASSWORD 'tasks_api_password';
CREATE DATABASE tasks_api;
GRANT ALL PRIVILEGES ON DATABASE tasks_api TO tasks_api;
