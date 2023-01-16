import React, { Suspense, useCallback, useState } from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions/index';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { TextField } from '../../../../shared/capture-models/editor/input-types/TextField/TextField';
import { Button } from '../../../../shared/navigation/Button';
import { ReadMoreIcon } from '../../../../shared/icons/ReadMoreIcon';
import { BrowserComponent } from '../../../../shared/utility/browser-component';

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
        <BrowserComponent fallback={<div />}>
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
        </BrowserComponent>
      )}
      renderFooter={({ close }: any) => (
        <Button
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
