import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useCanvasUserTasks } from './use-canvas-user-tasks';

export function useIsCanvasComplete() {
  const { project } = useSiteConfiguration();
  const { canvasTask, canUserSubmit, isLoading } = useCanvasUserTasks();

  const maximumNumberOfContributors = !canUserSubmit && !isLoading;
  const completedAndHidden = !project.allowSubmissionsWhenCanvasComplete && canvasTask?.status === 3;

  return {
    maximumNumberOfContributors,
    completedAndHidden,
  };
}
