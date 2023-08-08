import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { useApi } from '../../shared/hooks/use-api';
import { useInvalidateAfterSubmission } from './use-invalidate-after-submission';
import { useProjectManifestTasks } from './use-project-manifest-tasks';
import { RouteContext } from './use-route-context';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

const defaultScope: any[] = [];
export function useManifestUserTasks() {
  const invalidate = useInvalidateAfterSubmission();
  const config = useSiteConfiguration();
  const api = useApi();
  const { user, scope = defaultScope } = api.getIsServer() ? { user: undefined } : api.getCurrentUser() || {};
  const { data: manifestTask, isLoading, refetch, updatedAt } = useProjectManifestTasks();

  const [updateClaim] = useMutation(
    async ({ revisionRequest: response, context }: { revisionRequest: RevisionRequest; context: RouteContext }) => {
      if (context.manifestId && context.projectId) {
        const respStatus = response.revision.status;

        if (respStatus === 'draft') {
          // Create user task and mark as in progress.
          await api.createResourceClaim(context.projectId, {
            revisionId: response.revision.id,
            manifestId: context.manifestId,
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
            collectionId: context.collectionId,
            status: 2,
          });
          await invalidate();
        }
      }
    }
  );

  return useMemo(() => {
    const userTasks = manifestTask ? manifestTask.userTasks : undefined;
    const userContributions = (userTasks || []).filter(
      task => task.type === 'crowdsourcing-task' && task.status !== -1
    );

    const canContribute =
      user &&
      (scope.indexOf('site.admin') === -1 ||
        scope.indexOf('models.contribute') === -1 ||
        scope.indexOf('models.admin') === -1);

    const maxContributors =
      manifestTask?.maxContributors && manifestTask.totalContributors
        ? manifestTask.maxContributors >= manifestTask.totalContributors
        : false;

    // if max contributors reached check that the current user isnt one of them
    const maxContributorsReached = maxContributors ? !userTasks?.some(t => t.type === 'crowdsourcing-task') : false;

    const canUserSubmit = user && !!manifestTask?.canUserSubmit;

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

    const completedAndHide = manifestTask?.manifestTask?.status === 3;

    const canManifestTakeSubmission = !completedAndHide && !maxContributorsReached;
    const canSubmitAnother = canSubmitMultiple && canSubmitAfterRejection && canSubmitAfterSubmission;

    const preventFurtherSubmission =
      !canManifestTakeSubmission || !canSubmitAnother || !(canContribute && canUserSubmit);

    const markedAsUnusable =
      allTasksDone &&
      (userContributions.length
        ? !!userContributions.find(t => (t.status === 2 || t.status === 3) && !t.state.revisionId)
        : false);

    return {
      user,
      isLoading,
      manifestTask: manifestTask?.manifestTask,
      userTasks,
      markedAsUnusable,
      isManifestComplete: manifestTask?.isManifestComplete,
      allTasksDone,
      completedAndHide,
      canUserSubmit,
      canContribute,
      updateClaim,
      updatedAt,
      refetch,
      preventFurtherSubmission,
    };
  }, [
    manifestTask,
    user,
    scope,
    config.project.modelPageOptions?.preventContributionAfterRejection,
    config.project.modelPageOptions?.preventContributionAfterSubmission,
    config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource,
    isLoading,
    updateClaim,
    updatedAt,
    refetch,
  ]);
}
