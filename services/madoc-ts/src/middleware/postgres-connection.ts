import { Middleware } from 'koa';
import { DatabasePoolConnectionType, DatabasePoolType } from 'slonik';
import { ChangeDiscoveryRepository } from '../activity-streams/change-discovery-repository';
import { AnnotationStylesRepository } from '../repository/annotation-styles-repository';
import { CaptureModelRepository } from '../capture-model-server/capture-model-repository';
import { MediaRepository } from '../repository/media-repository';
import { NotificationRepository } from '../repository/notification-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { PluginRepository } from '../repository/plugin-repository';
import { ProjectRepository } from '../repository/project-repository';
import { ThemeRepository } from '../repository/theme-repository';
import { ApiKeyRepository } from '../repository/api-key-repository';
import { EnvConfig } from '../types/env-config';

export const postgresConnection = (
  pool: DatabasePoolType,
  useConnections = false,
  env: EnvConfig
): Middleware => async (context, next) => {
  async function handleConnection(connection: DatabasePoolConnectionType) {
    context.connection = connection;

    // Set up repositories.
    context.pageBlocks = new PageBlocksRepository(connection);
    context.media = new MediaRepository(connection);
    context.apiKeys = new ApiKeyRepository(connection);
    context.plugins = new PluginRepository(connection);
    context.themes = new ThemeRepository(connection);
    context.changeDiscovery = new ChangeDiscoveryRepository(connection);
    context.notifications = new NotificationRepository(connection);
    context.projects = new ProjectRepository(connection);
    context.annotationStyles = new AnnotationStylesRepository(connection);
    context.captureModels = new CaptureModelRepository(connection, {
      capture_model_api_migrated: env.flags.capture_model_api_migrated,
    });

    await next();
  }

  if (useConnections) {
    await pool.connect(async connection => {
      await handleConnection(connection);
    });
  } else {
    await handleConnection(pool);
  }
};
