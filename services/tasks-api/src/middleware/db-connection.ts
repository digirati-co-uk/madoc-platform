import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';
import { sql } from '../database/sql';

export const dbConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  context.sql = sql;

  await pool.connect(async connection => {
    context.connection = connection;
    await next();
  });
};
