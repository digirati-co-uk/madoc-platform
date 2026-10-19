import { useEffect, useRef } from 'react';
import { matchRoutes, RouteObject, useLocation } from 'react-router-dom';
import { useApi } from '../../shared/hooks/use-api';

export function PageViewTracker({ routes }: { routes: RouteObject[] }) {
  const api = useApi();
  const location = useLocation();
  const lastView = useRef<string | undefined>(undefined);
  const project = matchRoutes(routes, location)?.slice(-1)[0]?.params.slug;
  useEffect(() => {
    const view = `${location.pathname}${location.search}`;
    if (lastView.current === view) return;
    lastView.current = view;
    // Memory only; no visitor cookie, local storage, URL, or retry queue.
    void api.recordPageView(project ? { project } : {}).catch(() => {
      // Analytics must never interrupt browsing or contributions.
    });
  }, [api, location.pathname, location.search, project]);
  return null;
}
