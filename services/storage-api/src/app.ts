import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import { StorageManager } from '@slynova/flydrive';
import { errorHandler } from './middleware/error-handler';
import { createRouter } from './router';
import { parseJwt } from './middleware/parse-jwt';
import { AppConfig } from './types';

export async function createApp(config: AppConfig) {
  const app = new Koa();

  const router = createRouter(config);
  app.context.routes = router;
  app.context.storage = new StorageManager(config.storageManager);
  app.context.localDisk = config.localDisk;
  app.context.gatewayHost = config.gatewayHost;
  app.context.sizeLimits = config.sizeLimits;
  app.context.defaultDisk = config.storageManager.default;
  app.context.enableIIIF = config.enableIIIF;

  app.use(errorHandler);
  app.use(json({ pretty: config.env !== 'production' }));
  app.use(logger());
  app.use(parseJwt);
  app.use(router.routes()).use(router.allowedMethods());

  process.on('SIGINT', async () => {
    // Do any clean up.
    process.exit(0);
  });

  return app;
}
