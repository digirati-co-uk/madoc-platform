import { useUser } from '../../shared/hooks/use-site';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestTask } from './use-manifest-task';

export function useCanvasNavigation() {
  const { userTasks } = useManifestTask();
  const user = useUser();
  const config = useSiteConfiguration();
  const bypassCanvasNavigation = user
    ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.revision') !== -1
    : userTasks && userTasks.length > 0;
  const preventCanvasNavigation = !config.project.allowCanvasNavigation;

  const showWarning = preventCanvasNavigation && !bypassCanvasNavigation;
  const showCanvasNavigation = !preventCanvasNavigation || bypassCanvasNavigation;

  return {
    showWarning,
    showCanvasNavigation,
    bypassCanvasNavigation,
    preventCanvasNavigation,
  };
}
