import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { dbConnection } from './middleware/db-connection';
import { jwtMock } from './middleware/jwt-mock';
import { migrate } from './migrate';

export async function createApp(router: TypedRouter<any, any>) {
  const app = new Koa();
  const pool = createPostgresPool();

  await migrate();

  app.context.routes = router;

  // Validator.
  app.context.ajv = new Ajv();
  app.context.ajv.addSchema(require('../schemas/create-task.json'), 'create-task');
  app.context.ajv.addSchema(require('../schemas/update-task.json'), 'update-task');

  app.use(jwtMock);
  app.use(dbConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  app.use(errorHandler);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
