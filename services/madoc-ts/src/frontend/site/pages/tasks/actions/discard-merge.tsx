import React from 'react';
import { CrowdsourcingReviewMerge } from '../../../../../gateway/tasks/crowdsourcing-review';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '@capture-models/editor';
import { useMutation } from 'react-query';
import { EditorToolbarButton, EditorToolbarIcon, EditorToolbarLabel } from '../../../../shared/atoms/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/atoms/Button';
import { DeleteForeverIcon } from '../../../../shared/icons/DeleteForeverIcon';

export const DiscardMerge: React.FC<{
  merge: CrowdsourcingReviewMerge;
  reviewTaskId: string;
  onDiscard: () => void;
}> = ({ merge, reviewTaskId, onDiscard }) => {
  const api = useApi();
  const store = Revisions.useStore();
  const [discardMerge, { status }] = useMutation(async () => {
    const state = store.getState();
    const revisionRequest = state.revisions[merge.mergeId];
    await api.reviewMergeDiscard({
      merge,
      revision: revisionRequest,
      reviewTaskId,
    });
    onDiscard();
  });

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      autoHeight={true}
      title="Discard merge"
      render={() => (
        <div>
          <strong>Are you sure you want to delete this revision?</strong>
          <ul>
            <li>This will not remove the original base revision you started from</li>
            <li>Any changes you have made will be removed</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          disabled={status === 'loading'}
          onClick={() => {
            discardMerge().then(() => {
              close();
            });
          }}
        >
          Discard changes
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <DeleteForeverIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>Discard merge</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
