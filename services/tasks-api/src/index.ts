import { createApp } from './app';
import { config, port } from './config';

async function main() {
  const app = await createApp(config);

  app.listen(port);

  if (config.env !== 'production') {
    console.log(`Server ready at: http://localhost:${port}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
