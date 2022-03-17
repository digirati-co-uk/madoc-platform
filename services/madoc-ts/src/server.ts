import { genRSA } from './utility/gen-rsa';
import { syncJwtRequests } from './utility/sync-jwt-requests';

async function main() {
  await genRSA();
  await syncJwtRequests();

  const config = require('../config.json');
  const { createApp } = require('./app');
  const { config: env } = require('./config');
  const port = process.env.SERVER_PORT || 3000;

  const app = await createApp(config, env);

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:${port}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
