import path from 'path';
import { createApp } from './app';
import {
  fileSizeLimitMb,
  formFileSizeLimitMb,
  gatewayHost,
  jsonFileSizeLimitMb,
  port,
  textFileSizeLimitMb,
} from './config';

async function main() {
  const app = await createApp({
    env: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    localDisk: path.resolve(process.cwd(), './files'),
    gatewayHost,
    enableIIIF: true,
    sizeLimits: {
      file: fileSizeLimitMb,
      form: formFileSizeLimitMb,
      json: jsonFileSizeLimitMb,
      text: textFileSizeLimitMb,
    },
    storageManager: {
      default: 'local',
      disks: {
        local: {
          config: {
            root: path.resolve(process.cwd(), './files'),
          },
          driver: 'local',
        },
      },
    },
  });

  app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server ready at: http://localhost:3000`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
