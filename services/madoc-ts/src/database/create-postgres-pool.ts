import { createPool } from 'slonik';
import { config } from '../config';

export function createPostgresPool() {
  return createPool(
    `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
    {
      maximumPoolSize: config.postgres_pool_size, // Default: 10
      connectionTimeout: 'DISABLE_TIMEOUT',
    }
  );
}
