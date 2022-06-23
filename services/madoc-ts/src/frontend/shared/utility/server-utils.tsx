import { matchRoutes, RouteObject, useLocation, useRoutes } from 'react-router-dom';

export function RenderConfigRoutes({ routes }: { routes: RouteObject[] }) {
  const location = useLocation();
  console.log('matchRoutes', matchRoutes(routes, location));

  return useRoutes(routes);
}

export function matchUniversalRoutes(routes: RouteObject[], pathname: string) {
  return matchRoutes(routes as any, pathname) as any;
}
