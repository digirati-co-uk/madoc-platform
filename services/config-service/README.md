# config-service

Hono + TypeScript replacement for `madoc-config-server-django`.

## API

This service keeps the same route surface used by Madoc:

- `GET /configurator`
- `POST /configurator`
- `GET /configurator/query`
- `GET /configurator/:id/`
- `PUT /configurator/:id/`
- `GET /configurator/:id/versions`
- `GET /configurator/:id/versions/:versionId`
- `GET /configurator/:id/datetime/:dateTimeString`

## Environment

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_SCHEMA`
- `MIGRATE` (`true` / `false`)
- `SCHEMAS_PATH` (default: `/app/configurator/schemas`)
- `DEFAULT_CONFIG_PATH` (default: `/app/configurator/default_config`)
- `PORT` (default: `8000`)

## Tests

Run the ported Django parity tests with:

```bash
pnpm test
```
