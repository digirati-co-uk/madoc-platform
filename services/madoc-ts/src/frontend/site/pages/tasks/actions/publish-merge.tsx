import React from 'react';
import { CrowdsourcingReviewMerge } from '../../../../../gateway/tasks/crowdsourcing-review';
import { useApi } from '../../../../shared/hooks/use-api';
import { Revisions } from '@capture-models/editor';
import { useMutation } from 'react-query';
import { EditorToolbarButton, EditorToolbarIcon, EditorToolbarLabel } from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/navigation/Button';
import { GradingIcon } from '../../../../shared/icons/GradingIcon';

export const PublishMerge: React.FC<{
  merge: CrowdsourcingReviewMerge;
  toMergeRevisionIds: string[];
  toMergeTaskIds: string[];
  reviewTaskId: string;
  onPublish: () => void;
}> = ({ merge, reviewTaskId, toMergeTaskIds, toMergeRevisionIds, onPublish }) => {
  const api = useApi();
  const store = Revisions.useStore();
  const [publishMerge, { status }] = useMutation(async () => {
    const state = store.getState();
    const revisionRequest = state.revisions[merge.mergeId];
    await api.reviewMergeApprove({
      revision: revisionRequest,
      reviewTaskId,
      toMergeRevisionIds,
      toMergeTaskIds,
      merge,
    });
    onPublish();
  });

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      autoHeight={true}
      title="Approve submission"
      render={() => (
        <div>
          <ul>
            <li>All of the revisions in the merge will be marked as approved</li>
            <li>The new merged revision will be published</li>
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <Button
          disabled={status === 'loading'}
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            publishMerge().then(() => close());
          }}
        >
          Approve
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <GradingIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>Publish merge</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
