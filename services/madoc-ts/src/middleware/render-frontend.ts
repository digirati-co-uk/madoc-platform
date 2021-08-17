import { siteFrontend } from '../routes/admin/frontend';
import { RouteMiddleware } from '../types/route-middleware';
import { omekaSite } from './omeka-site';

export const renderFrontend: RouteMiddleware = async (context, next) => {
  await omekaSite(context, async () => {
    await siteFrontend(context, next);
  });
};
