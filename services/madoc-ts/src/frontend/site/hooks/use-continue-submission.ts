import { useMemo } from 'react';
import { useApi } from '../../shared/hooks/use-api';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasUserTasks } from './use-canvas-user-tasks';
import { useManifestUserTasks } from './use-manifest-user-tasks';

export function useContinueSubmission() {
  const canvasTasks = useCanvasUserTasks();
  const manifestTasks = useManifestUserTasks();
  const config = useSiteConfiguration();
  const api = useApi();
  const { user } = api.getIsServer() ? { user: undefined } : api.getCurrentUser() || {};

  return useMemo(() => {
    let totalReady = 0;
    const tasks = config.project.claimGranularity === 'canvas' ? canvasTasks?.userTasks : manifestTasks.inProgress;

    const allModels =
      tasks && tasks.length
        ? tasks.filter(task => {
            if (user && task.assignee?.id === user.id && task.type === 'crowdsourcing-task') {
              if (task.status !== -1 && task.status !== 3) {
                totalReady++;
              }
              return true;
            }
            return false;
          })
        : null;

    return [allModels, totalReady] as const;
  }, [canvasTasks, config.project.claimGranularity, manifestTasks.inProgress, user]);
}
