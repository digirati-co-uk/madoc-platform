import { siteFrontend } from '../routes/admin/frontend';
import { RouteMiddleware } from '../types/route-middleware';
import { siteState } from './site-state';

export const renderFrontend: RouteMiddleware = async (context, next) => {
  await siteState(context, async () => {
    await siteFrontend(context, next);
  });
};
