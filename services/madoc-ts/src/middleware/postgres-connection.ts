import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';
import { MediaRepository } from '../repository/media-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { ThemeRepository } from '../repository/theme-repository';

export const postgresConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  await pool.connect(async connection => {
    context.connection = connection;

    // Set up repositories.
    context.pageBlocks = new PageBlocksRepository(connection);
    context.media = new MediaRepository(connection);
    context.themes = new ThemeRepository(connection);

    await next();
  });
};
