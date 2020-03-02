import { RouteMiddleware } from '../types';

export const indexPage: RouteMiddleware = ctx => {
  ctx.response.body = `<h1>Hello world</h1>`;
};
