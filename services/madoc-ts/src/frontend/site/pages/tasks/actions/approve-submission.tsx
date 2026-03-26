import React, { useCallback, useState } from 'react';
import { ProjectFull } from '../../../../../types/project-full';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import { useSite } from '../../../../shared/hooks/use-site';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import CheckCircleIcon from '../../../../shared/icons/CheckCircleIcon';

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
  const isApproveDisabled = loading || !!disabledReason;

  const approveApiCall = useCallback(() => {
    if (disabledReason || !acceptedRevision) {
      return;
    }

    const definition = project && project.template ? api.projectTemplates.getDefinition(project.template, site.id) : null;

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
  }, [acceptedRevision, api.crowdsourcing, api.projectTemplates, disabledReason, onApprove, project, site.id, userTaskId]);

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
      title={disabledReason || t('Approve') || ''}
      render={() => (
        <div>
          {disabledReason ? <p>{disabledReason}</p> : null}
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
