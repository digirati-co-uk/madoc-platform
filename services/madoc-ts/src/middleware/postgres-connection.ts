import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';

export const postgresConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  await pool.connect(async connection => {
    context.connection = connection;
    await next();
  });
};
