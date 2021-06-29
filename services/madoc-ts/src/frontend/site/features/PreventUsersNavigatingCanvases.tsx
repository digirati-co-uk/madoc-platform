import { useMemo } from 'react';
import { useApi } from '../../shared/hooks/use-api';
import { useProjectManifestTasks } from '../hooks/use-project-manifest-tasks';
import { useRouteContext } from '../hooks/use-route-context';
import { useSiteConfiguration } from './SiteConfigurationContext';

export function usePreventCanvasNavigation() {
  const siteConfiguration = useSiteConfiguration();
  const { projectId } = useRouteContext();
  const { data } = useProjectManifestTasks();
  const api = useApi();
  const user = api.getIsServer() ? undefined : api.getCurrentUser();
  const manifestUserTasks = data ? data.userTasks : undefined;

  return useMemo(() => {
    // Data.
    const userCanSubmit = user
      ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.contribute') !== -1
      : false;
    const bypassCanvasNavigation = user
      ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.revision') !== -1
      : false;
    const showWarning =
      projectId &&
      !siteConfiguration.project.allowCanvasNavigation &&
      (manifestUserTasks ? manifestUserTasks.length === 0 : true);
    const randomlyAssignCanvas = projectId && siteConfiguration.project.randomlyAssignCanvas;
    const showNavigationContent = !showWarning || bypassCanvasNavigation;
    const claimManifest = siteConfiguration.project.claimGranularity === 'manifest';

    return {
      manifestUserTasks,
      showWarning,
      userCanSubmit,
      randomlyAssignCanvas,
      showNavigationContent,
      claimManifest,
    };
  }, [
    manifestUserTasks,
    projectId,
    siteConfiguration.project.allowCanvasNavigation,
    siteConfiguration.project.claimGranularity,
    siteConfiguration.project.randomlyAssignCanvas,
    user,
  ]);
}
