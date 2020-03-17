import { createPool } from 'slonik';
import { config } from '../config';

export function createPostgresPool() {
  return createPool(
    `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`
  );
}
