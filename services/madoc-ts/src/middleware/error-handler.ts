import { Middleware } from 'koa';
import { NotFound } from '../utility/errors/not-found';
import { ReactServerError } from '../utility/errors/react-server-error';
import { RequestError } from '../utility/errors/request-error';
import { ServerError } from '../utility/errors/server-error';
import { SlonikError } from 'slonik';
import { ApiError } from '../utility/errors/api-error';
import { ConflictError } from '../utility/errors/conflict';
import { errors } from 'jose';

export const errorHandler: Middleware = async (context, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof RequestError) {
      context.response.body = { error: err.message };
      context.status = 400;
      return;
    } else if (err instanceof ServerError) {
      context.response.status = 500;
    } else if (err instanceof NotFound) {
      if (err.message) {
        context.response.body = { error: err.message };
      }
      context.response.status = 404;
    } else if (err instanceof ConflictError) {
      context.response.status = 409;
      context.response.body = { error: err.message };
    } else if (err instanceof SlonikError) {
      console.log(err);
      context.response.status = 404;
    } else if (err instanceof ApiError) {
      context.response.status = 400;
      context.response.body = { error: err.message };
    } else if (err instanceof errors.JWTExpired) {
      // @todo refresh token?
      context.response.status = 401;
      context.response.body = { error: err.message };
      return;
    } else {
      console.log('Unhandled error');
      console.log(err);
      context.response.status = 500;
    }

    if (process.env.NODE_ENV === 'development' && context.response.status !== 409 && context.response.status !== 400) {
      context.response.body = `
        <h1>Server error</h1>
        <p>This will only appear in development.</p>
        <pre>${err.message}</pre>
        <pre>${err.stack}</pre>
      `;
    }
  }
};
