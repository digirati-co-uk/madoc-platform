import { RevisionRequest } from '@capture-models/types';
import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from '../../shared/hooks/use-api';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useInvalidateAfterSubmission } from './use-invalidate-after-submission';
import { useProjectCanvasTasks } from './use-project-canvas-tasks';
import { RouteContext } from './use-route-context';

const defaultScope: any[] = [];
export function useCanvasUserTasks() {
  const invalidate = useInvalidateAfterSubmission();
  const config = useSiteConfiguration();
  const api = useApi();
  const { user, scope = defaultScope } = api.getIsServer() ? { user: undefined } : api.getCurrentUser() || {};
  const { data: canvasTask, isLoading, refetch, updatedAt } = useProjectCanvasTasks();

  const [updateClaim] = useMutation(
    async ({ revisionRequest: response, context }: { revisionRequest: RevisionRequest; context: RouteContext }) => {
      if (context.canvasId && context.projectId) {
        const respStatus = response.revision.status;

        if (respStatus === 'draft') {
          // Create user task and mark as in progress.
          await api.createResourceClaim(context.projectId, {
            revisionId: response.revision.id,
            manifestId: context.manifestId,
            canvasId: context.canvasId,
            collectionId: context.collectionId,
            status: 1,
          });

          await invalidate();
        }

        if (respStatus === 'submitted') {
          // Create user task and mark as in review.
          await api.createResourceClaim(context.projectId, {
            revisionId: response.revision.id,
            manifestId: context.manifestId,
            canvasId: context.canvasId,
            collectionId: context.collectionId,
            status: 2,
          });
          await invalidate();
        }
      }
    }
  );

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
      updatedAt,
      refetch,
    };
  }, [
    user,
    scope,
    isLoading,
    canvasTask,
    refetch,
    updatedAt,
    updateClaim,
    config.project.allowSubmissionsWhenCanvasComplete,
    config.project.claimGranularity,
  ]);
}
