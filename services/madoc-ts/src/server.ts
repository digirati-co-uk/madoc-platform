import { syncJwtRequests } from './utility/sync-jwt-requests';

async function main() {
  await syncJwtRequests();

  const config = require('../config.json');
  const { createApp } = require('./app');
  const { port } = require('./config');
  const { router } = require('./router');

  const app = await createApp(router, config);

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:${port}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
