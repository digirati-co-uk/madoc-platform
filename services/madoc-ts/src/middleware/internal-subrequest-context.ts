import type { Middleware } from 'koa';
import { runWithInternalRequestContext } from '../gateway/internal-request-context';

export const internalSubrequestContext: Middleware = async (context, next) => {
  return runWithInternalRequestContext(context, next);
};
