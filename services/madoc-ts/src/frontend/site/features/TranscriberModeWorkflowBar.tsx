import React from 'react';
import { WorkflowBar } from '../../shared/components/WorkflowBar';
import { useManifestStructure } from '../../shared/hooks/use-manifest-structure';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useModelPageConfiguration } from '../hooks/use-model-page-configuration';
import { useRouteContext } from '../hooks/use-route-context';
import { useSubmitAllClaims } from '../hooks/use-submit-all-claims';

export const TranscriberModeWorkflowBar: React.FC = () => {
  const { fixedTranscriptionBar } = useModelPageConfiguration();
  const { isManifestComplete, userManifestStats } = useManifestTask();
  const { userTasks, canUserSubmit } = useCanvasUserTasks();
  const { submitAllClaims, isSubmitting, canSubmit: canSubmitClaims } = useSubmitAllClaims();
  const { manifestId } = useRouteContext();
  const { data: structure } = useManifestStructure(manifestId);

  // In transcriber mode, all tasks should have the same status.
  const firstUserTask = userTasks ? userTasks[0] : undefined;

  const willExpireSoon = false;
  const isComplete = isManifestComplete;
  const isSubmitted = firstUserTask?.status === 2 || firstUserTask?.status === 3;
  const canSubmit = !!canUserSubmit && canSubmitClaims;
  const isUnusable = firstUserTask?.status === 4;
  const hasExpired = false;
  const isLoading = isSubmitting;

  return (
    <WorkflowBar
      fixed={fixedTranscriptionBar}
      actions={{
        onUnusable() {
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
        },
      }}
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
