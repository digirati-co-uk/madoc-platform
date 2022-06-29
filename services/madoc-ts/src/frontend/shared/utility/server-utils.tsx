import { RouteObject, useRoutes } from 'react-router-dom';

export function RenderConfigRoutes({ routes }: { routes: RouteObject[] }) {
  return useRoutes(routes);
}
