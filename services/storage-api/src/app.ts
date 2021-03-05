import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import { StorageManager } from '@slynova/flydrive';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { parseJwt } from './middleware/parse-jwt';
import * as path from 'path';

export async function createApp(router: TypedRouter<any, any>) {
  const app = new Koa();

  app.context.routes = router;
  app.context.storage = new StorageManager({
    default: 'local',
    disks: {
      local: {
        config: {
          root: path.resolve(__dirname, '../files'),
        },
        driver: 'local',
      },
    },
  });
  app.context.localDisk = path.resolve(__dirname, '../files');

  app.use(errorHandler);
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  app.use(parseJwt);
  app.use(router.routes()).use(router.allowedMethods());

  process.on('SIGINT', async () => {
    // Do any clean up.
    process.exit(0);
  });

  return app;
}
