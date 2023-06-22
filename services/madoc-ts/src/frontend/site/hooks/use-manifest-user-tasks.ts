import { useMemo } from 'react';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
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
    const reviews = manifestTask?.userTasks
      ? manifestTask.userTasks.filter(
          task => (task as BaseTask).type === 'crowdsourcing-review' && (task.status === 2 || task.status === 1)
        )
      : [];

    const userTasks = manifestTask ? manifestTask.userTasks : undefined;
    const userContributions = (userTasks || []).filter(
      task => task.type === 'crowdsourcing-task' && task.status !== -1
    );
    const completedAndHide = manifestTask?.manifestTask?.status === 3;
    const canUserSubmit = user && !!manifestTask?.canUserSubmit;

    const canContribute =
      user &&
      (scope.indexOf('site.admin') !== -1 ||
        scope.indexOf('models.contribute') !== -1 ||
        scope.indexOf('models.admin') !== -1);

    const allTasksDone = userContributions.length
      ? !userContributions.find(t => t.status === 0 || t.status === 1)
      : false;

    const markedAsUnusable =
      allTasksDone &&
      (userContributions.length
        ? !!userContributions.find(t => (t.status === 2 || t.status === 3) && !t.state.revisionId)
        : false);

    const maxContributorsReached =
      manifestTask?.maxContributors && manifestTask.totalContributors
        ? manifestTask.maxContributors <= manifestTask.totalContributors
        : false;

    const cantSubmitAfterRejection = config.project.modelPageOptions?.preventContributionAfterRejection
      ? userTasks?.some(task => task.status === -1)
      : false;

    const cantSubmitAfterSubmission = config.project.modelPageOptions?.preventContributionAfterSubmission
      ? userContributions?.some(task => task.status === 2)
      : false;

    const cantSubmitMultiple = config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource
      ? userContributions.length > 0
      : false;

    const preventFurtherSubmission =
      !canContribute &&
      !canUserSubmit &&
      allTasksDone &&
      maxContributorsReached &&
      cantSubmitAfterRejection &&
      cantSubmitAfterSubmission &&
      cantSubmitMultiple;

    return {
      user,
      isLoading,
      manifestTask: manifestTask?.manifestTask,
      reviews,
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
