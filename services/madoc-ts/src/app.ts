import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { postgresConnection } from './middleware/postgres-connection';
import { jwtMock } from './middleware/jwt-mock';
import { migrate } from './migrate';
import { createMysqlPool } from './database/create-mysql-pool';
import { omekaPage } from './middleware/omeka-page';
import { ExternalConfig } from './types';

export async function createApp(router: TypedRouter<any, any>, config: ExternalConfig) {
  const app = new Koa();
  const pool = createPostgresPool();
  const mysqlPool = createMysqlPool();

  await migrate();

  app.context.externalConfig = config;
  app.context.routes = router;
  app.context.mysql = mysqlPool;

  // Validator.
  app.context.ajv = new Ajv();
  app.context.ajv.addSchema(require('../schemas/example.json'), 'example');

  app.use(jwtMock);
  app.use(postgresConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  app.use(errorHandler);
  app.use(omekaPage);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
