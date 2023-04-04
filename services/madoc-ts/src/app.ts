import { promises } from 'fs';
import * as path from 'path';
import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import Ajv from 'ajv';
import { strategies } from './auth';
import { checkExpiredManifests } from './cron/check-expired-manifests';
import './frontend/shared/plugins/globals';
import { CompletionsExtension } from './extensions/completions/extension';
import { createPluginManager } from './middleware/create-plugin-manager';
import { disposeApis } from './middleware/dispose-apis';
import { errorHandler } from './middleware/error-handler';
import { HTML_ADMIN_PATH, HTML_SITE_PATH, SCHEMAS_PATH } from './paths';
import { EnvConfig } from './types/env-config';
import { createAwaiter } from './utility/awaiter';
import { castBool } from './utility/cast-bool';
import { CronJobs } from './utility/cron-jobs';
import { Mailer } from './utility/mailer';
import { createPostgresPool } from './database/create-postgres-pool';
import { postgresConnection } from './middleware/postgres-connection';
import { migrate } from './migrate';
import { staticPage } from './middleware/static-page';
import { siteManager } from './middleware/site-api';
import { setJwt } from './middleware/set-jwt';
import { generateKeys } from './utility/generate-keys';
import { router } from './router';
import { createBackend } from './middleware/i18n/i18next.server';
import { ExternalConfig } from './types/external-config';
import './types/application-context';
import k2c from 'koa2-connect';
import cookieParser from 'cookie-parser';
import schedule from 'node-schedule';
import passport from 'koa-passport';
import { WebhookServerExtension } from './webhooks/webhook-server-extension';

const { readFile, readdir } = promises;

export async function createApp(config: ExternalConfig, env: EnvConfig) {
  const app = new Koa();
  const pool = createPostgresPool(env.postgres);
  const i18nextPromise = createBackend();
  const { awaitProperty, awaiter } = createAwaiter();

  if (process.env.NODE_APP_INSTANCE === '0') {
    if (process.env.NODE_ENV === 'production' || castBool(process.env.MIGRATE, false)) {
      await migrate();
    }
  }

  // Generate cookie keys.
  app.keys = generateKeys();

  app.context.externalConfig = config;
  app.context.routes = router;
  app.context.cron = new CronJobs();
  app.context.completions = new CompletionsExtension();
  app.context.webhookExtension = new WebhookServerExtension();

  awaitProperty(createPluginManager(pool), manager => {
    app.context.pluginManager = manager;
  });

  app.context.mailer = new Mailer(env.smtp || {});

  // Set i18next
  awaitProperty(
    i18nextPromise.then(async ([, i18next]) => await i18next),
    i18next => {
      app.context.i18next = i18next;
    }
  );

  awaitProperty(app.context.mailer.verify(), () => {
    if (!app.context.mailer.enabled) {
      console.log('WARNING: SMTP has not been configured');
    }
  });

  if (process.env.NODE_ENV !== 'development') {
    awaitProperty(readFile(HTML_SITE_PATH), html => {
      app.context.siteTemplate = html.toString('utf-8');
    });

    awaitProperty(readFile(HTML_ADMIN_PATH), html => {
      app.context.adminTemplate = html.toString('utf-8');
    });
  }

  // Validator.
  app.context.ajv = new Ajv();

  for (const file of await readdir(SCHEMAS_PATH)) {
    if (!file.startsWith('.')) {
      awaitProperty(
        // eslint-disable-next-line no-async-promise-executor
        (async () => {
          const pathToFile = path.resolve(SCHEMAS_PATH, file);
          const data = await readFile(pathToFile);
          return JSON.parse(data.toString('utf-8'));
        })(),
        (schema: any) => {
          const name = path.basename(file, '.json');
          app.context.ajv.addSchema(schema, name);
        }
      );
    }
  }

  app.use(k2c(cookieParser(app.keys)));
  app.use(postgresConnection(pool, config.pooledDatabase, env));
  app.use(json({ pretty: process.env.NODE_ENV !== 'production' }));
  app.use(logger());
  // Disabled for now, causing issues logging in.
  // app.use(conditional());

  let enabled = false;
  for (const strategy of strategies) {
    if (strategy.isAvailable()) {
      enabled = true;
      strategy.register();
    }
  }

  if (enabled) {
    passport.serializeUser(function(user: any, done) {
      done(null, user);
    });

    passport.deserializeUser(function(user: any, done) {
      done(null, user);
    });

    app.use(passport.initialize());
  }

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

  await awaiter();

  return app;
}
