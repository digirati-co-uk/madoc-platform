import React, { useCallback, useMemo, useState } from 'react';
import { CrowdsourcingReviewMerge } from '../../../../gateway/tasks/crowdsourcing-review';
import { useApi } from '../../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { useLoadedCaptureModel } from '../../../shared/hooks/use-loaded-capture-model';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
import { MaximiseWindow } from '../../../shared/atoms/MaximiseWindow';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/atoms/EditorToolbar';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { ViewContent } from '../../../shared/components/ViewContent';
import { RevisionTopLevel } from '../../../shared/caputre-models/RevisionTopLevel';
import { ModalButton } from '../../../shared/components/Modal';
import { Button, LinkButton } from '../../../shared/atoms/Button';
import { ArrowForwardIcon } from '../../../shared/icons/ArrowForwardIcon';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import TimeAgo from 'react-timeago';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { SaveMergeChanges } from './actions/save-merge-changes';
import { DiscardMerge } from './actions/discard-merge';
import { PublishMerge } from './actions/publish-merge';

const MergeCrowdsourcingTask: React.FC<{
  merge: CrowdsourcingReviewMerge;
  reviewTaskId: string;
  goBack: (opts?: { refresh?: boolean; revisionId?: string }) => void;
}> = ({ merge, reviewTaskId, goBack }) => {
  // Load mergeRevision to get the capture model id.
  const api = useApi();
  const [currentRevision, setCurrentRevision] = useState(merge.mergeId);
  const { data: mergeRevision, status, refetch } = useQuery(
    ['model-revision', { id: merge.mergeId }],
    async () => {
      if (!merge.mergeId) {
        return;
      }

      return await api.getCaptureModelRevision(merge.mergeId);
    },
    {
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  const revisionTasksToMerge = useMemo(() => {
    return [...merge.toMerge, merge.revisionTaskId];
  }, [merge.revisionTaskId, merge.toMerge]);

  const { data: mergeTasks } = useQuery(['merge-tasks', { ids: revisionTasksToMerge }], async () => {
    return Promise.all(revisionTasksToMerge.map(id => api.getTaskById<CrowdsourcingTask>(id)));
  });

  const mergedModelIds = mergeTasks
    ? mergeTasks.filter(task => task.id !== merge.revisionTaskId).map(task => task.state.revisionId as string)
    : [];

  // Load full capture model with all revision.
  const modelId = mergeRevision?.captureModelId;

  const [{ captureModel, canvas }, modelStatus, refetchModel] = useLoadedCaptureModel(modelId);

  const nextRevision = useCallback(() => {
    setCurrentRevision(rev => {
      const currentIdx = mergedModelIds.indexOf(rev);
      if (mergedModelIds[currentIdx + 1]) {
        return mergedModelIds[currentIdx + 1];
      }
      return merge.mergeId;
    });
  }, [merge.mergeId, mergedModelIds]);

  const previousRevision = useCallback(() => {
    setCurrentRevision(rev => {
      const currentIdx = mergedModelIds.indexOf(rev);
      if (currentIdx === -1) {
        return mergedModelIds[mergedModelIds.length - 1];
      }
      if (mergedModelIds[currentIdx - 1]) {
        return mergedModelIds[currentIdx - 1];
      }
      return merge.mergeId;
    });
  }, [merge.mergeId, mergedModelIds]);

  if (status === 'error') {
    return (
      <div>
        This merge may be corrupted. Would you like to remove it?{' '}
        <Button
          onClick={() => {
            api.reviewMergeDiscard({ merge, reviewTaskId: reviewTaskId, revision: merge.mergeId }).then(() => {
              goBack({ refresh: true });
            });
          }}
        >
          Discard merge
        </Button>
      </div>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <Revisions.Provider captureModel={captureModel} revision={currentRevision}>
              <EditorToolbarContainer>
                <EditorToolbarButton onClick={() => goBack()}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>

                <EditorToolbarSpacer />

                <EditorToolbarButton onClick={previousRevision} disabled={currentRevision === merge.mergeId}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>
                <EditorToolbarButton
                  as={ModalButton}
                  button={true}
                  autoHeight={true}
                  title="Change revision"
                  render={({ close }: any) => (
                    <div>
                      <Button
                        onClick={() => {
                          setCurrentRevision(merge.mergeId);
                          close();
                        }}
                      >
                        Back to main revision
                      </Button>

                      <Heading3>Revisions being merged</Heading3>

                      <TableContainer>
                        {mergeTasks
                          ? mergeTasks.map(task =>
                              task.state.revisionId === merge.revisionId ? null : (
                                <TableRow
                                  key={task.id}
                                  onClick={() => {
                                    if (task.state.revisionId) {
                                      setCurrentRevision(task.state.revisionId);
                                    }
                                    close();
                                  }}
                                  interactive
                                >
                                  <TableRowLabel>
                                    <strong>{task.assignee?.name}</strong>
                                  </TableRowLabel>
                                  <TableRowLabel>{task.name}</TableRowLabel>
                                  {task.modified_at ? (
                                    <TableRowLabel>
                                      <TimeAgo date={task.modified_at} />
                                    </TableRowLabel>
                                  ) : null}
                                </TableRow>
                              )
                            )
                          : null}
                      </TableContainer>
                    </div>
                  )}
                >
                  <EditorToolbarLabel>Change revision</EditorToolbarLabel>
                </EditorToolbarButton>
                <EditorToolbarButton
                  $rightBorder
                  onClick={nextRevision}
                  disabled={currentRevision === mergedModelIds[mergedModelIds.length - 1]}
                >
                  <EditorToolbarIcon>
                    <ArrowForwardIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>

                <EditorToolbarSpacer />

                <SaveMergeChanges
                  mergeId={merge.mergeId}
                  onSave={async () => {
                    await Promise.all([refetch(), refetchModel()]);
                  }}
                />

                <DiscardMerge
                  merge={merge}
                  reviewTaskId={reviewTaskId}
                  onDiscard={() => {
                    goBack({ refresh: true });
                  }}
                />

                <PublishMerge
                  merge={merge}
                  reviewTaskId={reviewTaskId}
                  toMergeRevisionIds={mergedModelIds}
                  toMergeTaskIds={revisionTasksToMerge}
                  onPublish={() => {
                    goBack({ refresh: true });
                  }}
                />

                <EditorToolbarButton onClick={toggle}>
                  <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                </EditorToolbarButton>
              </EditorToolbarContainer>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ width: '67%' }}>
                  {canvas ? <ViewContent target={captureModel.target as any} canvas={canvas} /> : null}
                </div>
                <div style={{ width: '33%', padding: '1em' }}>
                  {merge.mergeId !== currentRevision ? (
                    <WarningMessage style={{ marginBottom: '1em' }}>
                      This is read-only,{' '}
                      <LinkButton $inherit onClick={() => setCurrentRevision(merge.mergeId)}>
                        switch to the main revision
                      </LinkButton>{' '}
                      to make changes
                    </WarningMessage>
                  ) : null}
                  <RevisionTopLevel
                    allowNavigation={false}
                    allowEdits={false}
                    onSaveRevision={async rev => {
                      console.log(rev);
                    }}
                    readOnly={merge.mergeId !== currentRevision}
                  />
                </div>
              </div>
            </Revisions.Provider>
          ) : (
            'loading...'
          )
        }
      </MaximiseWindow>
    </ThemeProvider>
  );
};

export default MergeCrowdsourcingTask;
