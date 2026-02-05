import { serve } from '@hono/node-server';

import { appConfig } from './config.js';
import { ConfigService } from './configurator.js';
import { ConfigRepository } from './db.js';
import { createConfigApp } from './app.js';

export async function bootstrap(): Promise<void> {
  const repository = new ConfigRepository();
  const configService = new ConfigService(repository);
  const app = createConfigApp(configService);

  try {
    await repository.waitUntilReady(appConfig.startupRetryCount, appConfig.startupRetryMs);

    if (appConfig.migrate) {
      await repository.migrate();
    }

    serve(
      {
        fetch: app.fetch,
        hostname: appConfig.host,
        port: appConfig.port,
      },
      info => {
        console.log(`Config service listening on http://${info.address}:${info.port}`);
      }
    );

    const shutdown = async () => {
      await repository.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Config service failed to start', error);
    await repository.close();
    process.exit(1);
  }
}

void bootstrap();
