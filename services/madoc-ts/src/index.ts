import { createApp } from './app';
import { port } from './config';
import { router } from './router';
const config = require('../config.json');

async function main() {
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
