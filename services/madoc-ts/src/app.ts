import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
// @ts-ignore
//import conditional from 'koa-conditional-get';
import Ajv from 'ajv';
import { errorHandler } from './middleware/error-handler';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { postgresConnection } from './middleware/postgres-connection';
import { migrate } from './migrate';
import { createMysqlPool } from './database/create-mysql-pool';
import { omekaPage } from './middleware/omeka-page';
import { omekaApi } from './middleware/omeka-api';
import { syncOmeka } from './utility/sync-omeka';
import { setJwt } from './middleware/set-jwt';
import { generateKeys } from './utility/generate-keys';
import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';
import { createBackend } from './middleware/i18n/i18next.server';
import { ExternalConfig } from './types/external-config';
// @ts-ignore
import k2c from 'koa2-connect';
import cookieParser from 'cookie-parser';

export async function createApp(router: TypedRouter<any, any>, config: ExternalConfig) {
  const app = new Koa();
  const i18nextPromise = createBackend();
  const pool = createPostgresPool();
  const mysqlPool = createMysqlPool();

  if (process.env.NODE_ENV === 'production' || process.env.MIGRATE) {
    await migrate();
  }

  await syncOmeka(mysqlPool, pool, config);

  // Generate cookie keys.
  app.keys = generateKeys();

  app.context.externalConfig = config;
  app.context.routes = router;
  app.context.mysql = mysqlPool;

  // Set i18next
  const [, i18next] = await i18nextPromise;
  app.context.i18next = await i18next;

  // Validator.
  app.context.ajv = new Ajv();
  for (const file of readdirSync(path.resolve(__dirname, '..', 'schemas'))) {
    const name = path.basename(file, '.json');
    app.context.ajv.addSchema(
      JSON.parse(readFileSync(path.resolve(__dirname, '..', 'schemas', file)).toString('utf-8')),
      name
    );
  }

  app.use(k2c(cookieParser(app.keys)));
  app.use(postgresConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  // Disabled for now, causing issues logging in.
  // app.use(conditional());

  app.use(errorHandler);
  app.use(omekaPage);
  app.use(setJwt);

  app.use(omekaApi);
  app.use(router.routes()).use(router.allowedMethods());

  process.on('SIGINT', async () => {
    console.log('closing database connections...');
    await Promise.all([pool.end(), new Promise(resolve => mysqlPool.end(resolve))]);
    console.log('done');
    process.exit(0);
  });

  return app;
}
