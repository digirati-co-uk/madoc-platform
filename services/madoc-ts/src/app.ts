import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { checkExpiredManifests } from './cron/check-expired-manifests';
import './frontend/shared/plugins/globals';
import { createPluginManager } from './middleware/create-plugin-manager';
import { disposeApis } from './middleware/dispose-apis';
import { errorHandler } from './middleware/error-handler';
import { SCHEMAS_PATH } from './paths';
import { CronJobs } from './utility/cron-jobs';
import { MailConfig, Mailer } from './utility/mailer';
import { TypedRouter } from './utility/typed-router';
import { createPostgresPool } from './database/create-postgres-pool';
import { postgresConnection } from './middleware/postgres-connection';
import { migrate } from './migrate';
import { staticPage } from './middleware/static-page';
import { siteManager } from './middleware/site-api';
import { setJwt } from './middleware/set-jwt';
import { generateKeys } from './utility/generate-keys';
import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';
import { createBackend } from './middleware/i18n/i18next.server';
import { ExternalConfig } from './types/external-config';
// @ts-ignore
import k2c from 'koa2-connect';
import cookieParser from 'cookie-parser';
import schedule from 'node-schedule';

export const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export async function createApp(router: TypedRouter<any, any>, config: ExternalConfig, env: { smtp: MailConfig }) {
  const app = new Koa();
  const pool = createPostgresPool();
  const i18nextPromise = createBackend();

  if (process.env.NODE_APP_INSTANCE === '0') {
    if (process.env.NODE_ENV === 'production' || process.env.MIGRATE) {
      await migrate();
    }
  }

  // Generate cookie keys.
  app.keys = generateKeys();

  app.context.externalConfig = config;
  app.context.routes = router;
  app.context.cron = new CronJobs();
  app.context.pluginManager = await createPluginManager(pool);
  app.context.mailer = new Mailer(env.smtp);

  // Set i18next
  const [, i18next] = await i18nextPromise;
  app.context.i18next = await i18next;
  await app.context.mailer.verify();

  if (!app.context.mailer.enabled) {
    console.log('WARNING: SMTP has not been configured');
  }

  // Validator.
  app.context.ajv = new Ajv();
  for (const file of readdirSync(SCHEMAS_PATH)) {
    if (!file.startsWith('.')) {
      const name = path.basename(file, '.json');
      app.context.ajv.addSchema(JSON.parse(readFileSync(path.resolve(SCHEMAS_PATH, file)).toString('utf-8')), name);
    }
  }

  app.use(k2c(cookieParser(app.keys)));
  app.use(postgresConnection(pool));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  // Disabled for now, causing issues logging in.
  // app.use(conditional());

  app.use(errorHandler);
  app.use(staticPage);
  app.use(setJwt);
  app.use(siteManager);
  app.use(disposeApis);
  app.use(router.routes()).use(router.allowedMethods());

  // Cron jobs.
  if (process.env.NODE_APP_INSTANCE === '0' && process.env.NODE_ENV !== 'test') {
    (app.context.cron as CronJobs).addJob(
      'check-expired-manifests',
      'Check expired manifests',
      schedule.scheduleJob('*/15 * * * *', async function(fireDate) {
        await pool.connect(async connection => {
          await checkExpiredManifests({ ...app.context, connection } as any, fireDate);
        });
      })
    );
  }

  process.on('SIGINT', async () => {
    console.log('cancelling cron jobs...');
    app.context.cron.cancelAllJobs();

    console.log('done');
    process.exit(0);
  });

  return app;
}
