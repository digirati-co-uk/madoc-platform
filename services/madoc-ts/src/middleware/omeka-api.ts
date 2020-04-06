import { RouteMiddleware } from '../types';
import { OmekaApi } from '../utility/omeka-api';

export const omekaApi: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.omeka = new OmekaApi(context.mysql);
  await next();
};
