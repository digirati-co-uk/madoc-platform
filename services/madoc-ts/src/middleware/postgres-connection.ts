import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';
import { PageBlocksRepository } from '../repository/page-blocks-repository';

export const postgresConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  await pool.connect(async connection => {
    context.connection = connection;

    // Set up repositories.
    context.pageBlocks = new PageBlocksRepository(connection);

    await next();
  });
};
