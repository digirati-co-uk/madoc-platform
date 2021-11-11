import { SystemConfig } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const updateSystemConfig: RouteMiddleware<unknown, Partial<SystemConfig>> = async context => {
  await onlyGlobalAdmin(context);

  const systemConfig = await context.siteManager.getSystemConfig();
  const request = context.requestBody;
  const keys = Object.keys(systemConfig);
  for (const key of keys) {
    const newValue = (request as any)[key];
    const oldValue = (systemConfig as any)[key];
    if (typeof oldValue !== 'undefined' && newValue !== oldValue) {
      await context.siteManager.setSystemConfigValue(key, newValue);
    }
  }

  context.response.status = 201;
};
