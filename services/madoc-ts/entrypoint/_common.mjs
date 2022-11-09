import { watch } from 'node:fs';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import pm2 from 'pm2'

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadBundle(bundle, pm2Name) {
  // We want to watch some bundles.
  let times = 0;

  async function load() {
    times++;
    return import(bundle).catch(async e => {
      if (times < 20) {
        console.log('=> Error loading module, trying again...', e);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return load();
      }
      throw e;
    });
  }

  load()
    .then(() => {
      if (process.env.NODE_ENV !== 'production' && process.env.NODE_APP_INSTANCE === '0') {
        console.log('Starting watcher');
        let isChanging = false;
        const server = watch(resolve(__dirname, bundle), (eventType) => {
          if (eventType === 'change' && !isChanging) {
            console.log(`=> File change detected, reloading...`);
            isChanging = true;
            try {
              pm2.reload(pm2Name, {}, (err) => {
                console.log('failed to restart', err)
              });
            } catch (e) {
              console.error(e);
              console.log('FAILED TO RESTART.');
            }
          }
        });

        process.on('SIGINT', async () => {
          if (server) {
            server.close();
          }
        });
      }
    })
    .catch(e => {
      throw e;
    });
}
