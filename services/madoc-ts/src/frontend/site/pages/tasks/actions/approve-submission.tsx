import React, { useCallback, useMemo, useState } from 'react';
import { ProjectFull } from '../../../../../types/project-full';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useSite } from '../../../../shared/hooks/use-site';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import CheckCircleIcon from '../../../../shared/icons/CheckCircleIcon';
import { getTabularApprovalBlockedMessage, getTabularFlaggedCellCount } from '../../../../../utility/tabular-flags';

export const ApproveSubmission: React.FC<{
  onApprove: () => void;
  userTaskId: string;
  allUserTaskIds?: string[];
  allRevisionIds?: string[];
  reviewTaskId: string;
  project?: ProjectFull<any>;
  disabledReason?: string;
}> = ({ userTaskId, onApprove, project, disabledReason }) => {
  const { acceptedRevision } = Revisions.useStoreState(state => {
    return {
      acceptedRevision: state.currentRevision,
    };
  });
  const [loading, setIsLoading] = useState(false);
  const api = useApi();
  const site = useSite();
  const { t } = useTranslation();
  const revisionId = acceptedRevision?.revision.id;
  const { data: latestRevisionForApproval } = apiHooks.getCaptureModelRevision(() =>
    revisionId ? [revisionId] : undefined
  );
  const unresolvedFlaggedCellCount = useMemo(() => {
    const localCount = acceptedRevision ? getTabularFlaggedCellCount(acceptedRevision) : 0;
    if (localCount > 0) {
      return localCount;
    }

    if (!latestRevisionForApproval) {
      return 0;
    }

    return getTabularFlaggedCellCount(latestRevisionForApproval);
  }, [acceptedRevision, latestRevisionForApproval]);
  const unresolvedFlagsDisabledReason = unresolvedFlaggedCellCount > 0 ? getTabularApprovalBlockedMessage() : undefined;
  const resolvedDisabledReason = disabledReason || unresolvedFlagsDisabledReason;
  const isApproveDisabled = loading || !!resolvedDisabledReason;

  const approveApiCall = useCallback(() => {
    if (resolvedDisabledReason || !acceptedRevision) {
      return;
    }

    const definition =
      project && project.template ? api.projectTemplates.getDefinition(project.template, site.id) : null;

    setIsLoading(true);
    api.crowdsourcing
      .reviewApproveSubmission({
        revisionRequest: acceptedRevision,
        userTaskId,
        projectTemplate:
          definition && project
            ? {
                template: definition,
                config: project.template_config,
              }
            : undefined,
      })
      .then(async () => {
        await onApprove();
        setIsLoading(false);
      });
  }, [
    acceptedRevision,
    api.crowdsourcing,
    api.projectTemplates,
    onApprove,
    project,
    resolvedDisabledReason,
    site.id,
    userTaskId,
  ]);

  if (acceptedRevision?.revision.status === 'accepted') {
    return null;
  }

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      modalSize="sm"
      disabled={isApproveDisabled}
      autoHeight={true}
      title={resolvedDisabledReason || t('Approve') || ''}
      render={() => (
        <div>
          {resolvedDisabledReason ? <p>{resolvedDisabledReason}</p> : null}
          <ul>
            <li>{t('The submission will be approved and all other submissions will remain')}</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <ButtonRow>
          <Button
            data-cy="approve-submission"
            disabled={isApproveDisabled}
            onClick={() => {
              approveApiCall();
              close();
            }}
          >
            {t('Approve submission')}
          </Button>
        </ButtonRow>
      )}
    >
      <EditorToolbarIcon>
        <CheckCircleIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>{t('Approve')}</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
