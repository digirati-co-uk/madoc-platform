import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';

export const dbConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  await pool.connect(async connection => {
    context.connection = connection;
    await next();
  });
};
