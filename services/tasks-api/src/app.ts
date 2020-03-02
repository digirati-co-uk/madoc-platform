import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { dbConnection } from './middleware/db-connection';

export async function createApp(router: TypedRouter<any, any>) {
  const app = new Koa();
  const pool = createPostgresPool();

  app.context.routes = router;

  app.use(dbConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  app.use(errorHandler);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
