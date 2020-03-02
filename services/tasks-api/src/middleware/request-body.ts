import { Middleware } from 'koa';

export const requestBody: Middleware = async (context, next) => {
  if (context.request.body) {
    context.requestBody = context.request.body;
  }
  await next();
};
