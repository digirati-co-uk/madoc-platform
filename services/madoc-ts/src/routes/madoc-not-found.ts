import { RouteMiddleware } from '../types';

export const madocNotFound: RouteMiddleware = context => {
  context.status = 404;
  context.omekaPage = `<h1>Page not found</h1>`;
};
