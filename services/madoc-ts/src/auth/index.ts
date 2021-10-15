import { RouteWithParams } from '../utility/typed-router';
import { github } from './github';
import { loginWithProvider } from './utils/login-with-provider';

export const strategies = [
  // List all strategies here.
  github,
];

export function getAuthRoutes(): Record<keyof any, RouteWithParams<any>> {
  const router: Record<keyof any, RouteWithParams<any>> = {};

  for (const strategy of strategies) {
    Object.assign(router, strategy.router(loginWithProvider));
  }

  return router;
}
