import { RouteMiddleware } from '../types/route-middleware';

export const ping: RouteMiddleware = async context => {
  context.response.body = { ping: 'pong' };
};
