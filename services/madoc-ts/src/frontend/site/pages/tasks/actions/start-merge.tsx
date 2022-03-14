import React, { useCallback, useState } from 'react';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions/index';
import { useApi } from '../../../../shared/hooks/use-api';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { ModalButton } from '../../../../shared/components/Modal';
import ReactTimeago from 'react-timeago';
import { Button } from '../../../../shared/navigation/Button';
import { CallMergeIcon } from '../../../../shared/icons/CallMergeIcon';

export const StartMerge: React.FC<{
  userTask: CrowdsourcingTask & { id: string };
  allTasks: Array<CrowdsourcingTask & { id: string }>;
  reviewTaskId: string;
  onStartMerge: (taskId: string) => void;
}> = ({ reviewTaskId, onStartMerge, allTasks, userTask }) => {
  const [selected, setSelected] = useState(() => allTasks.filter(t => t.id !== userTask.id).map(t => t.id as string));
  const [isLoading, setIsLoading] = useState(false);
  const { currentRevision } = Revisions.useStoreState(state => {
    return {
      currentRevision: state.currentRevision,
    };
  });
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);
  const api = useApi();

  const startMergeApiCall = useCallback(() => {
    if (currentRevision) {
      setIsLoading(true);
      api
        .reviewPrepareMerge({
          reviewTaskId: reviewTaskId,
          revision: currentRevision,
          toMerge: selected,
          revisionTask: userTask.id,
        })
        .then(req => {
          deselectRevision({ revisionId: currentRevision.revision.id });
          setIsLoading(false);
          onStartMerge(req.revision.id);
        });
    }
  }, [api, currentRevision, deselectRevision, onStartMerge, reviewTaskId, selected]);

  return (
    <EditorToolbarButton
      as={ModalButton}
      button={true}
      autoHeight={true}
      title="Prepare merge"
      render={() => (
        <div>
          <div>Merge the following submissions into the base</div>
          <ul>
            {allTasks.map(task =>
              userTask.id === task.id ? null : (
                <li key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.indexOf(task.id) !== -1}
                      onChange={() => {
                        setSelected(list => {
                          if (list.indexOf(task.id) === -1) {
                            return [...list, task.id];
                          }
                          return list.filter(t => t !== task.id);
                        });
                      }}
                    />
                    {task.creator?.name || task.name}{' '}
                    {task.modified_at ? <ReactTimeago date={task.modified_at} /> : null}
                  </label>
                </li>
              )
            )}
          </ul>
        </div>
      )}
      renderFooter={({ close }: any) => (
        <Button
          style={{ marginLeft: 'auto' }}
          disabled={selected.length === 0 || isLoading}
          onClick={() => {
            startMergeApiCall();
            close();
          }}
        >
          Start merge
        </Button>
      )}
    >
      <EditorToolbarIcon>
        <CallMergeIcon />
      </EditorToolbarIcon>
      <EditorToolbarLabel>start merge</EditorToolbarLabel>
    </EditorToolbarButton>
  );
};
