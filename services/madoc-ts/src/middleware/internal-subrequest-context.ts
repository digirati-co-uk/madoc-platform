import type { Context, Middleware } from 'koa';
import type { IncomingMessage } from 'http';
import { runWithInternalRequestContext } from '../gateway/internal-request-context';
import { combineAbortSignals } from '../utility/combine-abort-signals';

export const internalSubrequestContext: Middleware<Context['state'], Context> = async (context, next) => {
  const controller = new AbortController();
  const parentSignal = (context.req as IncomingMessage & { apiAbortSignal?: AbortSignal }).apiAbortSignal;
  context.state.apiAbortSignal = parentSignal
    ? combineAbortSignals([parentSignal, controller.signal])
    : controller.signal;
  const cleanup = () => {
    context.res.removeListener('finish', cleanup);
    context.res.removeListener('close', disconnected);
  };
  const disconnected = () => {
    if (!context.res.writableFinished) controller.abort();
    cleanup();
  };
  context.res.once('finish', cleanup);
  context.res.once('close', disconnected);
  return runWithInternalRequestContext(context, next);
};
