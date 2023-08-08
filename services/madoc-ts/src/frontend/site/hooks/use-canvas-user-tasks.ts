import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
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
    const userTasks = canvasTask ? canvasTask.userTasks : undefined;
    const userContributions = (userTasks || []).filter(
      task => task.type === 'crowdsourcing-task' && task.status !== -1
    );

    const canContribute =
      user &&
      (scope.indexOf('site.admin') === -1 ||
        scope.indexOf('models.contribute') === -1 ||
        scope.indexOf('models.admin') === -1);

    const canClaimCanvas =
      user && (config.project.claimGranularity ? config.project.claimGranularity === 'canvas' : true);

    const maxContributors =
      canvasTask?.maxContributors && canvasTask.totalContributors
        ? canvasTask.maxContributors >= canvasTask.totalContributors
        : false;

    // if max contributors reached check that the current user isnt one of them
    const maxContributorsReached = maxContributors ? !userTasks?.some(t => t.type === 'crowdsourcing-task') : false;

    const canUserSubmit = user && !!canvasTask?.canUserSubmit;

    const canSubmitAfterRejection = config.project.modelPageOptions?.preventContributionAfterRejection
      ? !userTasks?.some(task => task.status === -1)
      : true;

    const canSubmitAfterSubmission = config.project.modelPageOptions?.preventContributionAfterSubmission
      ? !userContributions?.some(task => task.status === 2)
      : true;

    const canSubmitMultiple = config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource
      ? !userContributions || userContributions.length === 0 || userContributions?.some(task => task.status === 1)
      : true;

    const allTasksDone = userContributions.length
      ? !userContributions.find(t => t.status === 0 || t.status === 1)
      : false;

    const completedAndHide = !config.project.allowSubmissionsWhenCanvasComplete && canvasTask?.canvasTask?.status === 3;
    const completed = canvasTask?.canvasTask?.status === 3;

    const canCanvasTakeSubmission = canClaimCanvas && !completedAndHide && !maxContributorsReached;
    const canSubmitAnother = canSubmitMultiple && canSubmitAfterRejection && canSubmitAfterSubmission;

    const preventFurtherSubmission = !canCanvasTakeSubmission || !canSubmitAnother || !(canContribute && canUserSubmit);

    const markedAsUnusable =
      allTasksDone &&
      (userContributions.length
        ? !!userContributions.find(t => (t.status === 2 || t.status === 3) && !t.state.revisionId)
        : false);

    return {
      user,
      canvasTask: canvasTask?.canvasTask,
      isLoading,
      userTasks,
      markedAsUnusable,
      canCanvasTakeSubmission,
      canUserSubmit,
      completedAndHide,
      completed,
      canClaimCanvas,
      canContribute,
      updateClaim,
      updatedAt,
      refetch,
      preventFurtherSubmission,
    };
  }, [
    canvasTask,
    config.project.allowSubmissionsWhenCanvasComplete,
    config.project.claimGranularity,
    config.project.modelPageOptions?.preventContributionAfterRejection,
    config.project.modelPageOptions?.preventContributionAfterSubmission,
    config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource,
    user,
    scope,
    isLoading,
    updateClaim,
    updatedAt,
    refetch,
  ]);
}
