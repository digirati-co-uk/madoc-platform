import { promises } from 'fs';
import { join } from 'path';
import { genRSA } from './utility/gen-rsa';
import { syncJwtRequests } from './utility/sync-jwt-requests';
import { ROOT_PATH } from './paths';

async function main() {
  await genRSA();
  await syncJwtRequests();

  // @ts-ignore
  global.__SERVER__ = true;

  const config = await promises.readFile(join(ROOT_PATH, 'config.json')).then(r => JSON.parse(r.toString('utf-8')));
  const { createApp } = await import('./app');
  const { config: env } = await import('./config');
  const port = process.env.SERVER_PORT || 3000;

  const app = await createApp(config as any, env);

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:${port}`);
    if (process && process.send) {
      process.send('ready');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
