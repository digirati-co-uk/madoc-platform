const TRUE_VALUES = new Set(['true', '1', 'yes']);

function toBool(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }
  return TRUE_VALUES.has(value.toLowerCase());
}

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredNumber(name: string, fallback?: number): number {
  const raw = process.env[name] ?? (fallback !== undefined ? String(fallback) : undefined);
  if (!raw) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }
  return value;
}

function validateSchemaName(schema: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) {
    throw new Error(`Invalid PostgreSQL schema name: ${schema}`);
  }
  return schema;
}

export const appConfig = {
  host: process.env.HOST ?? '0.0.0.0',
  port: requiredNumber('PORT', 8000),
  migrate: toBool(process.env.MIGRATE, false),
  postgresHost: required('POSTGRES_HOST', 'shared-postgres'),
  postgresPort: requiredNumber('POSTGRES_PORT', 5432),
  postgresUser: required('POSTGRES_USER', 'postgres'),
  postgresPassword: required('POSTGRES_PASSWORD', 'postgres'),
  postgresDatabase: required('POSTGRES_DB', 'madoc'),
  postgresSchema: validateSchemaName(required('POSTGRES_SCHEMA', 'config_service')),
  schemasPath: process.env.SCHEMAS_PATH ?? '/app/configurator/schemas',
  defaultsPath: process.env.DEFAULT_CONFIG_PATH ?? '/app/configurator/default_config',
  startupRetryMs: requiredNumber('STARTUP_RETRY_MS', 1000),
  startupRetryCount: requiredNumber('STARTUP_RETRY_COUNT', 120),
  globalSeparator: '|',
};
