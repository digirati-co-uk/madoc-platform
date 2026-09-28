import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';

export const dbConnection =
  (pool: DatabasePoolType): Middleware =>
  async (context, next) => {
    context.connection = pool;
    await next();
  };
