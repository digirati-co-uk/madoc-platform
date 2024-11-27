import { RouteMiddleware } from '../types/route-middleware';

export type SlowRequests = Record<
  string,
  {
    key: string;
    count: number;
    avg: number;
    slowest: number;
  }
>;

const slowRequestStore: SlowRequests = {};

export const slowRequests: RouteMiddleware<{ slug: string }> = async (context, next) => {
  const requestStart = Date.now();
  await next();

  const routeKey = `${context.method} ${context._matchedRoute}`;

  const requestEnd = Date.now();
  const requestTime = requestEnd - requestStart;
  if (!slowRequestStore[routeKey]) {
    slowRequestStore[routeKey] = { key: routeKey, count: 0, avg: 0, slowest: 0 };
  }

  const existinRoute = slowRequestStore[routeKey];

  existinRoute.count++;
  existinRoute.avg = (existinRoute.avg * (existinRoute.count - 1) + requestTime) / existinRoute.count;
  existinRoute.slowest = Math.max(existinRoute.slowest, requestTime);

  if (Object.keys(slowRequestStore).length > 50) {
    // Sort by slowest.
    const sorted = Object.values(slowRequestStore).sort((a, b) => b.slowest - a.slowest);
    const slowest = sorted.pop();
    if (slowest && slowest.key) {
      delete slowRequestStore[slowest.key];
    }
  }
};

export function getSlowRequests() {
  return slowRequestStore;
}
