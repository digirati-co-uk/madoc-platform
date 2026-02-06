import { AsyncLocalStorage } from 'async_hooks';
import type { Context } from 'koa';

const contextStorage = new AsyncLocalStorage<Context>();

export function runWithInternalRequestContext<T>(context: Context, callback: () => Promise<T> | T): Promise<T> | T {
  return contextStorage.run(context, callback);
}

export function getInternalRequestContext() {
  return contextStorage.getStore();
}
