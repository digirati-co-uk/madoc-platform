import { RouteMiddleware } from '../../types/route-middleware';
import { genRSA } from '../../utility/gen-rsa';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';
import { pm2Restart } from './pm2';

export const keyRegenerate: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  await genRSA(true);

  // Restart services.
  await pm2Restart('auth');
  await pm2Restart('queue');
  await pm2Restart('scheduler');
  await pm2Restart('server'); // Restarting self..

  context.response.body = {
    success: true,
  };
};
