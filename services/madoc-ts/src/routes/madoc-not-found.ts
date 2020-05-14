import { RouteMiddleware } from '../types/route-middleware';

export const madocNotFound: RouteMiddleware = context => {
  context.status = 404;
  context.omekaPage = `<h1>Page not found</h1>`;
};
