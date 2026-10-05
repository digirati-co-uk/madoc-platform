import { promises } from 'fs';
import { join } from 'path';
import { genRSA } from './utility/gen-rsa';
import { syncJwtRequests } from './utility/sync-jwt-requests';
import { ROOT_PATH } from './paths';
import { registerGracefulServerShutdown } from './utility/graceful-server-shutdown';

async function main() {
  await genRSA();
  await syncJwtRequests();

  (globalThis as typeof globalThis & { __SERVER__?: boolean }).__SERVER__ = true;

  const config = await promises.readFile(join(ROOT_PATH, 'config.json')).then(r => JSON.parse(r.toString('utf-8')));
  const { createApp } = await import('./app');
  const { config: env } = await import('./config');
  const port = process.env.SERVER_PORT || 3000;

  const app = await createApp(config as any, env);

  const server = app.listen(port, () => {
    if (process.env.NODE_ENV !== 'production') console.log(`Server ready at: http://localhost:${port}`);
    process.send?.('ready');
  });
  registerGracefulServerShutdown(server, app.context.stopJobs, app.context.closeResources);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
