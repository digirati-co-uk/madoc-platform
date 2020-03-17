import { createApp } from './app';
import { port } from './config';
import { router } from './router';

async function main() {
  const app = await createApp(router);

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:3000`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
