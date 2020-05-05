import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { postgresConnection } from './middleware/postgres-connection';
import { migrate } from './migrate';
import { createMysqlPool } from './database/create-mysql-pool';
import { omekaPage } from './middleware/omeka-page';
import { omekaApi } from './middleware/omeka-api';
import { ExternalConfig } from './types';
import { syncOmeka } from './utility/sync-omeka';
import { setJwt } from './middleware/set-jwt';
import { generateKeys } from './utility/generate-keys';
import { syncJwtRequests } from './utility/sync-jwt-requests';

export async function createApp(router: TypedRouter<any, any>, config: ExternalConfig) {
  const app = new Koa();
  const pool = createPostgresPool();
  const mysqlPool = createMysqlPool();

  await syncJwtRequests();

  await migrate();

  await syncOmeka(mysqlPool, pool, config);

  // Generate cookie keys.
  app.keys = generateKeys();

  app.context.externalConfig = config;
  app.context.routes = router;
  app.context.mysql = mysqlPool;

  // Validator.
  app.context.ajv = new Ajv();
  app.context.ajv.addSchema(require('../schemas/example.json'), 'example');

  app.use(postgresConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  app.use(errorHandler);
  app.use(omekaPage);
  app.use(setJwt);
  app.use(omekaApi);
  app.use(router.routes()).use(router.allowedMethods());

  return app;
}
