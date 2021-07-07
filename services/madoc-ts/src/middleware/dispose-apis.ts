import { Middleware } from 'koa';

export const disposeApis: Middleware = async (context, next) => {
  // Ensure it always exists on the context.
  context.disposableApis = context.disposableApis ? context.disposableApis : [];

  await next();

  if (context.disposableApis && context.disposableApis.length) {
    for (const disposable of context.disposableApis) {
      try {
        if (disposable?.dispose) {
          disposable?.dispose();
        }
      } catch (e) {
        // no-op.
      }
    }
    context.disposableApis = [];
  }
};
