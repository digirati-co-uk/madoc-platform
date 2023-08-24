import pm2, { ProcessDescription } from 'pm2';
import { config } from '../../config';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

async function pm2Connect() {
  await new Promise<void>((resolve, reject) =>
    pm2.connect(error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    })
  );
}

async function pm2List() {
  return new Promise<ProcessDescription[]>((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(list);
    });
  });
}

export async function pm2Restart(process: string) {
  return new Promise<void>((resolve, reject) => {
    pm2.reload(process, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export const pm2Status: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  // Connect.
  await pm2Connect();

  const list = await pm2List();

  context.response.body = {
    build: config.build,
    list: list.map(item => {
      return {
        id: item.pm_id,
        name: item.name,
        monit: item.monit,
        stats: (item as any)?.pm2_env?.axm_monitor,
        max_memory_restart: (item as any)?.pm2_env?.max_memory_restart,
        instances: (item as any)?.pm2_env?.instances,
        status: (item as any)?.pm2_env?.status,
        uptime: (item as any)?.pm2_env?.pm_uptime,
      };
    }),
  };

  pm2.disconnect();
};

export const pm2RestartAuth: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting auth');
  await pm2Restart('auth');

  context.response.body = { success: true };
};

export const pm2RestartQueue: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting queue');
  await pm2Restart('queue');

  context.response.body = { success: true };
};

export const pm2RestartMadoc: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting server');
  await pm2Restart('server');

  context.response.body = { success: true };
};

export const pm2RestartScheduler: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  console.log('Restarting scheduler');
  await pm2Restart('scheduler');

  context.response.body = { success: true };
};
