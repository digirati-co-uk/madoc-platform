import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button } from '../../shared/navigation/Button';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { InfoMessage } from '../../shared/callouts/InfoMessage';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { WarningMessage } from '../../shared/callouts/WarningMessage';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { useUser } from '../../shared/hooks/use-site';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRouteContext } from '../hooks/use-route-context';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';

export function ManifestUserNotification(props: { isModal?: boolean }) {
  const { projectId, manifestId } = useRouteContext();
  const { refetch: refetchManifest } = useData(ManifestLoader);
  const config = useSiteConfiguration();
  const {
    isManifestComplete,
    canClaimManifest,
    userManifestTask,
    isFetched,
    refetch,
    filteredTasks,
    hasExpired,
  } = useManifestTask();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const { inProgress, done, inReview } = filteredTasks;
  const { isActive } = useProjectStatus();
  const { t } = useTranslation();
  const api = useApi();
  const { user, preventFurtherSubmission } = useManifestUserTasks();
  const isEdit = !preventFurtherSubmission && props.isModal;

  const [onSubmitForReview] = useMutation(async (tid: string) => {
    await api.updateTask(tid, {
      status: 2,
      status_text: 'in review',
    });
    await Promise.all([refetch(), refetchManifest()]);
  });

  if (!projectId || !manifestId || !isFetched || !isActive || !user) {
    return null;
  }

  const canReclaim = config.project.claimGranularity === 'manifest' && hasExpired && canClaimManifest;
  const taskIsDone = done.length > 0;

  if (canReclaim) {
    return (
      <WarningMessage>
        {t('Your claim on this manifest has expired, but you can continue where you left off')}
      </WarningMessage>
    );
  }

  if (hasExpired && !canReclaim) {
    return <ErrorMessage>{t('Your claim on this manifest has expired')}</ErrorMessage>;
  }

  if (isManifestComplete && !isEdit) {
    return <InfoMessage>{t('This manifest is complete')}</InfoMessage>;
  }

  if (config.project.claimGranularity === 'manifest' && !canClaimManifest && !userManifestTask) {
    return <InfoMessage>{t('Maximum number of contributors reached')}</InfoMessage>;
  }

  if (inReview.length && !isEdit) {
    return <WarningMessage>{t('This manifest is currently in review')}</WarningMessage>;
  }

  if (inProgress.length) {
    const inProgressTask = inProgress[0];

    const temporaryHold = userManifestTask && userManifestTask.status === 0;
    if (temporaryHold) {
      return null;
    }

    return (
      <InfoMessage>
        {t('You are currently working on this manifest')}{' '}
        {config.project.contributionMode !== 'transcription' && !showCaptureModelOnManifest ? (
          <Button onClick={() => onSubmitForReview(inProgressTask.id as string)} style={{ marginLeft: 10 }}>
            {t('Submit for review')}
          </Button>
        ) : null}
      </InfoMessage>
    );
  }

  if (taskIsDone && !isEdit) {
    return <SuccessMessage>{t('You have already completed this manifest')}</SuccessMessage>;
  }

  return null;
}

blockEditorFor(ManifestUserNotification, {
  type: 'default.ManifestUserNotification',
  label: 'Manifest user notifications',
  anyContext: ['manifest'],
  requiredContext: ['project', 'manifest'],
  editor: {},
});
