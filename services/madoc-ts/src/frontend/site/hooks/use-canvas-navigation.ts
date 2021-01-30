import { useApi } from '../../shared/hooks/use-api';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestUserTasks } from './use-manifest-user-tasks';

export function useCanvasNavigation() {
  const { tasks: manifestUserTasks } = useManifestUserTasks();
  const api = useApi();
  const user = api.getIsServer() ? undefined : api.getCurrentUser();
  const config = useSiteConfiguration();
  const bypassCanvasNavigation = user
    ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.revision') !== -1
    : manifestUserTasks && manifestUserTasks.length > 0;
  const preventCanvasNavigation = !config.project.allowCanvasNavigation;

  const showWarning = preventCanvasNavigation && !bypassCanvasNavigation;
  const showCanvasNavigation = !preventCanvasNavigation || bypassCanvasNavigation;

  return {
    showWarning,
    showCanvasNavigation,
    bypassCanvasNavigation,
  };
}
