import { UniversalRoute } from '../types';
import { matchRoutes, renderRoutes } from 'react-router-config';

export function renderUniversalRoutes(routes?: UniversalRoute[], params?: any) {
  if (!routes) {
    console.warn('renderUniversalRoutes called without routes');
    return null;
  }
  return renderRoutes(routes as any, params);
}

export function matchUniversalRoutes(
  routes: UniversalRoute[],
  pathname: string
): Array<{
  match: {
    params: any;
    url: string;
    path: string;
    isExact: boolean;
  };
  route: UniversalRoute;
}> {
  return matchRoutes(routes as any, pathname) as any;
}
