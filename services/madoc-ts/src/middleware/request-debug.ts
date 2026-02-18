import type { Context, Middleware, Next } from 'koa';

interface MiddlewareTimingEntry {
  order: number;
  name: string;
  totalMs: number;
  selfMs: number;
  downstreamMs: number;
}

interface RequestDebugState {
  startedAt: bigint;
  sequence: number;
  middleware: MiddlewareTimingEntry[];
}

const requestDebugStore = new WeakMap<Context, RequestDebugState>();

function toDurationMs(duration: bigint) {
  return Number((Number(duration) / 1_000_000).toFixed(2));
}

function isDebugEnabled(context: Context) {
  const debugParam = context.query.debug;
  const debugValue = Array.isArray(debugParam) ? debugParam[0] : debugParam;
  if (debugValue === undefined || debugValue === null) {
    return false;
  }
  const normalized = `${debugValue}`.toLowerCase();
  return normalized !== 'false' && normalized !== '0';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJsonResponseBody(context: Context, body: unknown): body is Record<string, unknown> {
  if (!isObject(body) || Array.isArray(body) || Buffer.isBuffer(body)) {
    return false;
  }

  if ('pipe' in body && typeof body.pipe === 'function') {
    return false;
  }

  const contentType = context.response.type || context.response.get('Content-Type') || '';
  if (!contentType) {
    return true;
  }

  const normalizedType = contentType.toLowerCase();
  return normalizedType.includes('/json') || normalizedType.includes('+json') || normalizedType.includes('json');
}

function getDebugState(context: Context) {
  return requestDebugStore.get(context);
}

function getMatchedRoute(context: Context) {
  return (context as Context & { _matchedRoute?: string })._matchedRoute || null;
}

export const requestDebugSetup: Middleware = async (context, next) => {
  if (isDebugEnabled(context)) {
    requestDebugStore.set(context, {
      startedAt: process.hrtime.bigint(),
      sequence: 0,
      middleware: [],
    });
  }

  await next();
};

export const requestDebugResponse: Middleware = async (context, next) => {
  await next();

  const debugState = getDebugState(context);
  if (!debugState) {
    return;
  }

  const responseBody = context.response.body;
  if (!isJsonResponseBody(context, responseBody)) {
    return;
  }

  const requestTotalMs = toDurationMs(process.hrtime.bigint() - debugState.startedAt);
  const middleware = [...debugState.middleware]
    .sort((a, b) => a.order - b.order)
    .map(({ name, totalMs, selfMs, downstreamMs }) => ({
      name,
      totalMs,
      selfMs,
      downstreamMs,
    }));

  const existingDebug = isObject(responseBody.debug) ? responseBody.debug : {};

  responseBody.debug = {
    ...existingDebug,
    request: {
      method: context.method,
      path: context.path,
      route: getMatchedRoute(context),
      status: context.status,
      totalMs: requestTotalMs,
    },
    middleware,
  };
};

export function withRequestDebugTiming<TMiddleware extends Middleware>(
  name: string,
  middleware: TMiddleware
): TMiddleware {
  const wrapped: Middleware = async (context, next) => {
    const debugState = getDebugState(context);
    if (!debugState) {
      await middleware(context, next);
      return;
    }

    const order = debugState.sequence++;
    const startedAt = process.hrtime.bigint();
    let downstreamTime = 0n;

    const timedNext: Next = async () => {
      const downstreamStart = process.hrtime.bigint();
      try {
        await next();
      } finally {
        downstreamTime += process.hrtime.bigint() - downstreamStart;
      }
    };

    try {
      await middleware(context, timedNext);
    } finally {
      const totalTime = process.hrtime.bigint() - startedAt;
      const selfTime = totalTime > downstreamTime ? totalTime - downstreamTime : 0n;
      debugState.middleware.push({
        order,
        name,
        totalMs: toDurationMs(totalTime),
        selfMs: toDurationMs(selfTime),
        downstreamMs: toDurationMs(downstreamTime),
      });
    }
  };

  return wrapped as TMiddleware;
}
