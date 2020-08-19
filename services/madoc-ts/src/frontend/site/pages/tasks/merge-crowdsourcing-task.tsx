import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CrowdsourcingReviewMerge } from '../../../../gateway/tasks/crowdsourcing-review';
import { useApi } from '../../../shared/hooks/use-api';
import { useMutation, useQuery } from 'react-query';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
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
import { CompareIcon } from '../../../shared/icons/CompareIcon';
import { DeleteForeverIcon } from '../../../shared/icons/DeleteForeverIcon';
import { GradingIcon } from '../../../shared/icons/GradingIcon';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { TableContainer, TableRow, TableRowLabel } from '../../../shared/atoms/Table';
import TimeAgo from 'react-timeago';
import { Heading3 } from '../../../shared/atoms/Heading3';

const SaveChanges: React.FC<{ mergeId: string; onSave: () => Promise<void> | void }> = ({ mergeId, onSave }) => {
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

const DiscardMerge: React.FC<{ merge: CrowdsourcingReviewMerge; reviewTaskId: string; onDiscard: () => void }> = ({
  merge,
  reviewTaskId,
  onDiscard,
}) => {
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

const PublishMerge: React.FC<{
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

                <EditorToolbarTitle>Test reviewer</EditorToolbarTitle>

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

                <SaveChanges
                  mergeId={merge.mergeId}
                  onSave={async () => {
                    await refetch({ force: true });
                    await refetchModel({ force: true });
                  }}
                />

                <EditorToolbarButton>
                  <EditorToolbarIcon>
                    <CompareIcon />
                  </EditorToolbarIcon>
                  <EditorToolbarLabel>Diff view</EditorToolbarLabel>
                </EditorToolbarButton>

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
