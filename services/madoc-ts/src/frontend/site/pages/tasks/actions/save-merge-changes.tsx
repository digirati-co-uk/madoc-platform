import React, { useEffect, useState } from 'react';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions/index';
import { useMutation } from 'react-query';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { CompareIcon } from '../../../../shared/icons/CompareIcon';

export const SaveMergeChanges: React.FC<{ mergeId: string; onSave: () => Promise<void> | void }> = ({
  mergeId,
  onSave,
}) => {
  const api = useApi();
  const store = Revisions.useStore();
  const [isSaved, setIsSaved] = useState(false);

  const [saveRevision, { status: savingStatus }] = useMutation(async () => {
    const state = store.getState();
    const revisionRequest = state.revisions[mergeId];
    if (revisionRequest) {
      await api.reviewMergeSave(revisionRequest);
      await onSave();
    }
  }, {});

  useEffect(() => {
    if (savingStatus === 'success') {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }
  }, [savingStatus]);

  return (
    <EditorToolbarButton onClick={() => saveRevision()} disabled={savingStatus === 'loading'}>
      <EditorToolbarIcon>
        <CompareIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>{isSaved ? 'Saved!' : 'Save changes'}</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
