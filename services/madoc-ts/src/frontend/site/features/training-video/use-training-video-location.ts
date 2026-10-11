import { matchPath, useLocation } from 'react-router-dom';
import { useRouteContext } from '../../hooks/use-route-context';

/**
 * The project for the current page. The site header renders above the project
 * routes, so it can't read the route params and falls back to the URL.
 */
export function useTrainingVideoProjectSlug(): string | undefined {
  const { projectId } = useRouteContext();
  const { pathname } = useLocation();
  return projectId || matchPath('/projects/:slug/*', pathname)?.params.slug || undefined;
}

/** Canvas and manifest contribution pages both end in /model. */
export function useIsContributionPage(): boolean {
  const { pathname } = useLocation();
  return /\/manifests\/[^/]+(\/c\/[^/]+)?\/model\/?$/.test(pathname);
}
