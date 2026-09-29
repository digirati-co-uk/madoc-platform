import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { errorHandler } from './middleware/error-handler';
import { createPostgresPool } from './database/create-postgres-pool';
import { dbConnection } from './middleware/db-connection';
import { parseJwt } from './middleware/parse-jwt';
import { migrate } from './migrate';
import { Queue } from 'bullmq';
import { queueEvents } from './middleware/queue-events';
import { router } from './router';
import { AppConfig } from './types';

export async function createApp(config: AppConfig) {
  const app = new Koa();
  const pool = createPostgresPool(config.postgres);

  if (config.migrate) {
    await migrate(config, pool);
  }

  app.context.routes = router;

  // Validator.
  app.context.ajv = new Ajv();
  app.context.ajv.addSchema(require('../schemas/create-task.json'), 'create-task');
  app.context.ajv.addSchema(require('../schemas/update-task.json'), 'update-task');

  if (config.enableQueue && config.redis) {
    app.context.getQueue = (name: string) =>
      new Queue(name, {
        connection: config.redis,
        ...(config.bullmq || {}),
      });
  }

  app.use(queueEvents(config.queue, config.queueList, config.enableQueue));

  app.use(parseJwt(config.jwt));
  app.use(dbConnection(pool));
  app.use(json({ pretty: config.env !== 'production' }));
  if (config.log) {
    app.use(logger());
  }
  app.use(errorHandler);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
