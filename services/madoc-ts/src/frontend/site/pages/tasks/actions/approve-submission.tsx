import React, { useCallback, useState } from 'react';
import { Revisions } from '@capture-models/editor';
import { useApi } from '../../../../shared/hooks/use-api';
import { EditorToolbarButton, EditorToolbarIcon, EditorToolbarLabel } from '../../../../shared/atoms/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button, ButtonRow } from '../../../../shared/atoms/Button';
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
      disabled={loading}
      autoHeight={true}
      title="Approve submission"
      render={() => (
        <div>
          <ul>
            <li>
              <strong>Approve</strong> - The submission will be approved and all other submission will remain
            </li>
            <li>
              <strong>Approve and remove remaining</strong> - The submission will be approved and all other submission
              will be removed. The users who created all of the submissions will see their submission approved. This can
              be good if merging multiple revisions.
            </li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <ButtonRow style={{ margin: '0 0 0 auto' }}>
          <Button
            onClick={() => {
              approveApiCall();
              close();
            }}
          >
            Approve
          </Button>
          <Button
            onClick={() => {
              approveAndRemoveApiCall();
              close();
            }}
          >
            Approve and remove remaining
          </Button>
        </ButtonRow>
      )}
    >
      <EditorToolbarIcon>
        <GradingIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>approve</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
