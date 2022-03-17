import { createPool } from 'slonik';
import { EnvConfig } from '../types/env-config';

export function createPostgresPool(config: EnvConfig['postgres']) {
  if (typeof config === 'string') {
    return createPool(config, {
      connectionTimeout: 'DISABLE_TIMEOUT',
    });
  }

  return createPool(
    `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
    {
      maximumPoolSize: config.postgres_pool_size, // Default: 10
      connectionTimeout: 'DISABLE_TIMEOUT',
    }
  );
}
