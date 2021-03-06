import { useMemo } from 'react';
import { useUser } from '../../shared/hooks/use-site';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasUserTasks } from './use-canvas-user-tasks';
import { useManifestUserTasks } from './use-manifest-user-tasks';

export function useContinueSubmission() {
  const canvasTasks = useCanvasUserTasks();
  const manifestTasks = useManifestUserTasks();
  const config = useSiteConfiguration();
  const user = useUser();

  return useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let assigned = 0;
    const tasks =
      config.project.claimGranularity === 'canvas' || config.project.contributionMode === 'transcription'
        ? canvasTasks?.userTasks
        : manifestTasks.inProgress;

    const allModels =
      tasks && tasks.length
        ? tasks.filter(task => {
            if (user && task.assignee?.id === `urn:madoc:user:${user.id}` && task.type === 'crowdsourcing-task') {
              if (task.status !== -1 && task.status !== 3 && task.status !== 2) {
                if (task.status_text === 'assigned') {
                  assigned++;
                } else {
                  if (task.state.revisionId) {
                    inProgress++;
                  }
                }
                return true;
              }
              if (task.status === 3 && task.state && task.state.revisionId) {
                completed++;
                return true;
              }
            }
            return false;
          })
        : null;

    return {
      tasks: allModels,
      inProgress,
      assigned,
      completed,
      loaded: !!tasks,
    };
  }, [canvasTasks, config.project.claimGranularity, manifestTasks.inProgress, user]);
}
