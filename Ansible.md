# Ansible


## Infrastructure

- Running the terraform plan
- Preparing dependencies for ubuntu box
- Configuring backups for services
    - Omeka files
    - MySQL Database
    - Postgres Database 
- Setting up application folder (synchronise from madoc config repo):
    - ./docker-compose.yaml
    - ./configuration
        - ./static
        - ./defaults
        - ./schema
    - .env
    - ./translations
- Setting up HTTPS

## Docker compose

- Running/updating a particular docker-compose.yaml (vars in role)
- Stopping a docker-compose running

## Application configuration

- Generation of key pair for JWT
- Adding public key to Gateway configurations
- Ensuring Postgres has required plugins, roles and databases

## Runtime commands
- Restart the Queue
- Restart single docker container
- Show logs?

## Development commands (static localhost inventory)
- Start/Restart dev server
- Stop dev server
