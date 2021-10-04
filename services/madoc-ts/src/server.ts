import { genRSA } from './utility/gen-rsa';
import { syncJwtRequests } from './utility/sync-jwt-requests';

async function main() {
  await genRSA();
  await syncJwtRequests();

  const config = require('../config.json');
  const { createApp } = require('./app');
  const { port, config: env } = require('./config');
  const { router } = require('./router');

  const app = await createApp(router, config, env);

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:${port}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
