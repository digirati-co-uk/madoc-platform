import { Middleware } from 'koa';
import { DatabasePoolType } from 'slonik';
import { ChangeDiscoveryRepository } from '../activity-streams/change-discovery-repository';
import { MediaRepository } from '../repository/media-repository';
import { NotificationRepository } from '../repository/notification-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { PluginRepository } from '../repository/plugin-repository';
import { ThemeRepository } from '../repository/theme-repository';

export const postgresConnection = (pool: DatabasePoolType): Middleware => async (context, next) => {
  await pool.connect(async connection => {
    context.connection = connection;

    // Set up repositories.
    context.pageBlocks = new PageBlocksRepository(connection);
    context.media = new MediaRepository(connection);
    context.plugins = new PluginRepository(connection);
    context.themes = new ThemeRepository(connection);
    context.changeDiscovery = new ChangeDiscoveryRepository(connection);
    context.notifications = new NotificationRepository(connection);

    await next();
  });
};
