import pm2, { ProcessDescription } from 'pm2';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

async function pm2Connect() {
  await new Promise((resolve, reject) =>
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

export const pm2Status: RouteMiddleware = async context => {
  userWithScope(context, ['site.admin']);

  // Connect.
  await pm2Connect();

  const list = await pm2List();

  context.response.body = {
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
