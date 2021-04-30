import { RevisionRequest } from '@capture-models/types';
import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from '../../shared/hooks/use-api';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useData } from '../../shared/hooks/use-data';
import { ManifestLoader } from '../components';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestUserTasks } from './use-manifest-user-tasks';
import { useRouteContext } from './use-route-context';

const defaultScope: any[] = [];
export function useCanvasUserTasks() {
  const { projectId, manifestId, collectionId, canvasId } = useRouteContext();
  const config = useSiteConfiguration();
  const api = useApi();
  const { refetch: refetchManifest } = useData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { user, scope = defaultScope } = api.getIsServer() ? { user: undefined } : api.getCurrentUser() || {};
  const { refetch: refetchManifestTasks } = useManifestUserTasks();
  const { data: canvasTask, isLoading, refetch } = apiHooks.getSiteProjectCanvasTasks(() =>
    projectId && canvasId ? [projectId, canvasId] : undefined
  );

  const [updateClaim] = useMutation(async (response: RevisionRequest) => {
    if (canvasId && projectId) {
      const respStatus = response.revision.status;

      if (respStatus === 'draft') {
        // Create user task and mark as in progress.
        await api.createResourceClaim(projectId, {
          revisionId: response.revision.id,
          manifestId,
          canvasId,
          collectionId,
          status: 1,
        });
        await refetch();
        if (manifestId) {
          await refetchManifest();
          await refetchManifestTasks();
        }
      }

      if (respStatus === 'submitted') {
        // Create user task and mark as in review.
        await api.createResourceClaim(projectId, {
          revisionId: response.revision.id,
          manifestId,
          canvasId,
          collectionId,
          status: 2,
        });
        await refetch();
        if (manifestId) {
          await refetchManifest();
          await refetchManifestTasks();
        }
      }
    }
  });

  return useMemo(() => {
    const reviews = canvasTask?.userTasks
      ? canvasTask.userTasks.filter(
          task => (task as BaseTask).type === 'crowdsourcing-review' && (task.status === 2 || task.status === 1)
        )
      : [];

    const userTasks = canvasTask ? canvasTask.userTasks : undefined;
    const userContributions = (userTasks || []).filter(
      task => task.type === 'crowdsourcing-task' && task.status !== -1
    );
    const completedAndHide = !config.project.allowSubmissionsWhenCanvasComplete && canvasTask?.canvasTask?.status === 3;
    const canClaimCanvas =
      user && (config.project.claimGranularity ? config.project.claimGranularity === 'canvas' : true);
    const canUserSubmit = user && !!canvasTask?.canUserSubmit;
    const canContribute = user && (scope.indexOf('site.admin') !== -1 || scope.indexOf('models.contribute') !== -1);
    const allTasksDone = userContributions.length
      ? !userContributions.find(t => t.status === 0 || t.status === 1)
      : false;
    const markedAsUnusable =
      allTasksDone &&
      (userContributions.length
        ? !!userContributions.find(t => (t.status === 2 || t.status === 3) && !t.state.revisionId)
        : false);

    return {
      user,
      canvasTask: canvasTask?.canvasTask,
      isLoading,
      reviews,
      userTasks,
      markedAsUnusable,
      isManifestComplete: canvasTask?.isManifestComplete,
      allTasksDone,
      completedAndHide,
      canClaimCanvas,
      canUserSubmit,
      canContribute,
      updateClaim,
      refetch,
    };
  }, [
    user,
    scope,
    isLoading,
    canvasTask,
    refetch,
    updateClaim,
    config.project.allowSubmissionsWhenCanvasComplete,
    config.project.claimGranularity,
  ]);
}
