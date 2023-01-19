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
}> = ({ userTaskId, allUserTaskIds, allRevisionIds, reviewTaskId, onApprove, project }) => {
  const { acceptedRevision } = Revisions.useStoreState(state => {
    return {
      acceptedRevision: state.currentRevision,
    };
  });
  const [loading, setIsLoading] = useState(false);
  const api = useApi();
  const site = useSite();
  const { t } = useTranslation();
  const revisionIdsToRemove = allRevisionIds?.filter(id => id && id !== acceptedRevision?.revision.id);
  const userTaskIdsToRemove = allUserTaskIds?.filter(id => id && id !== userTaskId);
  const approveAndRemoveApiCall = useCallback(() => {
    if (acceptedRevision && revisionIdsToRemove && userTaskIdsToRemove) {
      setIsLoading(true);
      api
        .reviewApproveAndRemoveSubmission({
          userTaskIds: userTaskIdsToRemove,
          reviewTaskId,
          acceptedRevision,
          revisionIdsToRemove,
        })
        .then(() => {
          setIsLoading(false);
          onApprove();
        });
    }
  }, [acceptedRevision, api, onApprove, reviewTaskId, revisionIdsToRemove, userTaskIdsToRemove]);

  const approveApiCall = useCallback(() => {
    if (acceptedRevision) {
      const definition =
        project && project.template ? api.projectTemplates.getDefinition(project.template, site.id) : null;

      setIsLoading(true);
      api
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
        .then(() => {
          setIsLoading(false);
          onApprove();
        });
    }
  }, [acceptedRevision, api, onApprove, userTaskId]);

  if (acceptedRevision?.revision.status === 'accepted') {
    return null;
  }

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      modalSize="sm"
      disabled={loading}
      autoHeight={true}
      title={t('Approve') || ''}
      render={() => (
        <div>
          <ul>
            <li>{t('The submission will be approved and all other submissions will remain')}</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <ButtonRow>
          <Button
            data-cy="approve-submission"
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
