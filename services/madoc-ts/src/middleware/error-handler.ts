import { Middleware } from 'koa';
import { NotFound } from '../utility/errors/not-found';
import { RequestError } from '../utility/errors/request-error';
import { ServerError } from '../utility/errors/server-error';
import { SlonikError } from 'slonik';
import { ApiError } from '../utility/errors/api-error';

export const errorHandler: Middleware = async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof RequestError) {
      context.response.body = { error: err.message };
      context.status = 400;
    } else if (err instanceof ServerError) {
      context.response.status = 500;
    } else if (err instanceof NotFound) {
      if (err.message) {
        context.response.body = { error: err.message };
      }
      context.response.status = 404;
    } else if (err instanceof SlonikError) {
      console.log(err);
      context.response.status = 404;
    } else if (err instanceof ApiError) {
      context.response.status = 400;
      context.response.body = { error: err.message };
    } else {
      console.log('Unhandled error');
      console.log(err);
      context.response.status = 500;
    }
  }
};
