import { createPool, Pool } from 'mysql';
import { config } from '../config';

export function createMysqlPool(): Pool {
  return createPool({
    connectionLimit: 10,
    host: config.mysql.host,
    user: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
  });
}
