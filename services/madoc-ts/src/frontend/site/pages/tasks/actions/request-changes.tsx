import React, { Suspense, useCallback, useState } from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '@capture-models/editor';
import { EditorToolbarButton, EditorToolbarIcon, EditorToolbarLabel } from '../../../../shared/atoms/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { TextField } from '@capture-models/editor/lib/input-types/TextField/TextField';
import { Button } from '../../../../shared/atoms/Button';
import { ReadMoreIcon } from '../../../../shared/icons/ReadMoreIcon';

export const RequestChanges: React.FC<{
  userTaskId: string;
  changesRequested?: null | string;
  onRequest: () => void;
}> = ({ changesRequested, userTaskId, onRequest }) => {
  const api = useApi();
  const [requestMessage, setRequestMessage] = useState(changesRequested || '');
  const [isLoading, setIsLoading] = useState(false);
  const { currentRevision } = Revisions.useStoreState(state => {
    return {
      currentRevision: state.currentRevision,
    };
  });
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

  const requestChangesApiCall = useCallback(() => {
    if (currentRevision) {
      setIsLoading(true);
      api
        .reviewRequestChanges({
          message: requestMessage,
          revisionRequest: currentRevision,
          userTaskId,
        })
        .then(() => {
          deselectRevision({ revisionId: currentRevision.revision.id });
          setIsLoading(false);
          onRequest();
        });
    }
  }, [api, currentRevision, deselectRevision, onRequest, requestMessage, userTaskId]);

  if (currentRevision?.revision.approved) {
    return null;
  }

  return (
    <EditorToolbarButton
      disabled={isLoading}
      as={ModalButton}
      button={true}
      autoHeight={true}
      title="Request changes"
      render={() => (
        <Suspense fallback={<div />}>
          <label htmlFor="message">Write a message to the contributor</label>
          <TextField
            id="message"
            type="text-field"
            value={requestMessage}
            label="Write message to the contributor"
            updateValue={setRequestMessage}
            multiline={true}
          />
          <p>Once requested the task will be assigned back to user</p>
        </Suspense>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            close();
            requestChangesApiCall();
          }}
        >
          Request changes
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <ReadMoreIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>request changes</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
