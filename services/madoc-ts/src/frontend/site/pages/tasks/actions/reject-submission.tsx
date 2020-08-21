import React, { useCallback, useState } from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '@capture-models/editor';
import { EditorToolbarButton, EditorToolbarIcon, EditorToolbarLabel } from '../../../../shared/atoms/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/atoms/Button';
import { DeleteForeverIcon } from '../../../../shared/icons/DeleteForeverIcon';

export const RejectSubmission: React.FC<{ onReject: () => void; userTaskId: string }> = ({ onReject, userTaskId }) => {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const { currentRevision } = Revisions.useStoreState(state => {
    return {
      currentRevision: state.currentRevision,
    };
  });
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

  const rejectApiCall = useCallback(() => {
    if (currentRevision) {
      setIsLoading(true);
      api
        .reviewRejectSubmission({
          revisionRequest: currentRevision,
          userTaskId,
        })
        .then(() => {
          deselectRevision({ revisionId: currentRevision.revision.id });
          setIsLoading(false);
          onReject();
        });
    }
  }, [api, currentRevision, deselectRevision, onReject, userTaskId]);

  if (!currentRevision || currentRevision.revision.approved) {
    return null;
  }

  return (
    <EditorToolbarButton
      as={ModalButton}
      disabled={isLoading}
      button={true}
      autoHeight={true}
      title="Reject submission"
      render={() => (
        <div>
          <strong>Are you sure you want to delete this revision and mark the task as rejected?</strong>
          <ul>
            <li>The user will be notified that the revision has been rejected</li>
            <li>You will no longer be able to see the content in the revision</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            close();
            rejectApiCall();
          }}
        >
          Reject changes
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <DeleteForeverIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>reject submission</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
