import { createPool } from 'slonik';
import { DBConfig } from '../types';

export function createPostgresPool(config: DBConfig) {
  return createPool(
    typeof config === 'string'
      ? config
      : `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
    {
      // connectionTimeout: 'DISABLE_TIMEOUT',
      maximumPoolSize: 64,
      connectionRetryLimit: 10, // DEFAULT: 3
      connectionTimeout: 30000, // 30 seconds - and then an error (*10 is 5 minutes)
    }
  );
}
