import React, { useCallback, useState } from 'react';
import { Revisions } from '@capture-models/editor';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../../shared/hooks/use-api';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { GradingIcon } from '../../../../shared/icons/GradingIcon';

export const ApproveSubmission: React.FC<{
  onApprove: () => void;
  userTaskId: string;
  allUserTaskIds: string[];
  allRevisionIds: string[];
  reviewTaskId: string;
}> = ({ userTaskId, allUserTaskIds, allRevisionIds, reviewTaskId, onApprove }) => {
  const { acceptedRevision } = Revisions.useStoreState(state => {
    return {
      acceptedRevision: state.currentRevision,
    };
  });
  const [loading, setIsLoading] = useState(false);
  const api = useApi();
  const { t } = useTranslation();
  const revisionIdsToRemove = allRevisionIds.filter(id => id && id !== acceptedRevision?.revision.id);
  const userTaskIdsToRemove = allUserTaskIds.filter(id => id && id !== userTaskId);
  const approveAndRemoveApiCall = useCallback(() => {
    if (acceptedRevision) {
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
      setIsLoading(true);
      api
        .reviewApproveSubmission({
          revisionRequest: acceptedRevision,
          userTaskId,
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
      title={t('Approve submission') || ''}
      render={() => (
        <div>
          <ul>
            <li>{t('The submission will be approved and all other submissions will remain')}</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <ButtonRow style={{ margin: '0 0 0 auto' }}>
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
        <GradingIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>{t('Approve submission')}</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
