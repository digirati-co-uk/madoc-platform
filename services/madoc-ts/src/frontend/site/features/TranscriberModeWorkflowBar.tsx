import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { WorkflowBar } from '../../shared/components/WorkflowBar';
import { useApi } from '../../shared/hooks/use-api';
import { useManifestStructure } from '../../shared/hooks/use-manifest-structure';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useInvalidateAfterSubmission } from '../hooks/use-invalidate-after-submission';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useModelPageConfiguration } from '../hooks/use-model-page-configuration';
import { useRouteContext } from '../hooks/use-route-context';
import { useSubmitAllClaims } from '../hooks/use-submit-all-claims';

export const TranscriberModeWorkflowBar: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();
  const { fixedTranscriptionBar } = useModelPageConfiguration();
  const invalidate = useInvalidateAfterSubmission();
  const { isManifestComplete, userManifestStats } = useManifestTask();
  const { userTasks, canUserSubmit, markedAsUnusable } = useCanvasUserTasks();
  const { inReview } = useManifestUserTasks();
  const { submitAllClaims, isSubmitting, canSubmit: canSubmitClaims } = useSubmitAllClaims();
  const { projectId, canvasId, manifestId } = useRouteContext();
  const { push } = useHistory();
  const { data: structure } = useManifestStructure(manifestId);

  // In transcriber mode, all tasks should have the same status.
  const firstUserTask = userTasks ? userTasks[0] : undefined;

  const willExpireSoon = false;
  const isComplete = isManifestComplete || !!inReview.length;
  const canSubmit = !!canUserSubmit && canSubmitClaims;
  const [isUnusable, setIsUsable] = useState(false);

  useEffect(() => {
    setIsUsable(markedAsUnusable);
  }, [markedAsUnusable]);

  // const isUnusable = firstUserTask?.status === 4;
  const hasExpired = false;
  const [markUnusable, markUnusableStatus] = useMutation(async (newValue: boolean) => {
    if (projectId && canvasId) {
      setIsUsable(newValue || false);

      if (newValue) {
        await api.createResourceClaim(projectId, {
          manifestId,
          canvasId,
          status: 2 as any,
        });
      } else {
        await api.createResourceClaim(projectId, {
          manifestId,
          canvasId,
          status: 1 as any,
        });
      }

      await invalidate();
    }
  });

  const [markAsTooDifficult, markDifficultStatus] = useMutation(async () => {
    if (projectId && manifestId) {
      await api.revokeResourceClaimOnManifest(projectId, manifestId);

      push(createLink({ projectId }));
    }
  });

  const isSubmitted = firstUserTask?.status === 2 && !isUnusable;
  const isLoading = isSubmitting || markUnusableStatus.isLoading || markDifficultStatus.isLoading;

  return (
    <WorkflowBar
      fixed={fixedTranscriptionBar}
      actions={{
        async onUnusable(newValue) {
          await markUnusable(newValue || false);
          await invalidate();
          // Mark current canvas task as complete, with state unusable=true
          // Set states to loading until mutation is complete.
          // Refresh task
        },
        onSubmit() {
          // Normal submit flow from capture model marking task as complete.
          submitAllClaims();
        },
        onTooDifficult() {
          // Warning to user
          // Then on confirm, mark manifest task and canvas tasks in the manifest as error / abandoned.
          // This is a new endpoint (deleteResourceClaim)
          markAsTooDifficult();
        },
      }}
      completeMessage={
        <>
          {t('Thank you. You finished this manifest. Go back to the project to find a new manifest to transcribe.')}{' '}
          <HrefLink href={createLink({ projectId })}>{t('Go back to project')}</HrefLink>
        </>
      }
      states={{
        isLoading,
        willExpireSoon,
        isComplete,
        isSubmitted,
        canSubmit,
        isUnusable,
        hasExpired,
      }}
      expires={new Date()}
      statistics={{
        done: userManifestStats?.done || 0,
        total: structure?.items.length || 0,
        progress: userManifestStats?.progress || 0,
      }}
    />
  );
};
