import { OmekaApi } from '../utility/omeka-api';
import { RouteMiddleware } from '../types/route-middleware';

export const omekaApi: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.omeka = new OmekaApi(context.mysql);
  await next();
};
