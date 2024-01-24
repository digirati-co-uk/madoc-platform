import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { CrowdsourcingReview } from '../../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../../../shared/capture-models/new/EditorContent';
import styled, { css } from 'styled-components';
import {
  CanvasViewerButton,
  CanvasViewerControls,
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
} from '../../../../shared/atoms/CanvasViewerGrid';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { CloseIcon } from '../../../../shared/icons/CloseIcon';
import { PreviewIcon } from '../../../../shared/icons/PreviewIcon';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import {
  EditorToolbarButton,
  EditorToolbarIcon,
  EditorToolbarLabel,
} from '../../../../shared/navigation/EditorToolbar';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { RefetchProvider, useRefetch } from '../../../../shared/utility/refetch-context';
import { useCrowdsourcingTaskDetails } from '../../../hooks/use-crowdsourcing-task-details';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { ApproveSubmission } from '../actions/approve-submission';
import { RejectSubmission } from '../actions/reject-submission';
import { RequestChanges } from '../actions/request-changes';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { EditIcon } from '../../../../shared/icons/EditIcon';
import { DirectEditButton } from '../../../../shared/capture-models/new/components/DirectEditButton';
import { MaximiseWindow } from '../../../../shared/layout/MaximiseWindow';
import { FullScreenExitIcon } from '../../../../shared/icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../../../../shared/icons/FullScreenEnterIcon';
import { Runtime } from '@atlas-viewer/atlas';
import { HomeIcon } from '../../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';
import { PlusIcon } from '../../../../shared/icons/PlusIcon';
import { useTranslation } from 'react-i18next';
import { extractIdFromUrn, parseUrn } from '../../../../../utility/parse-urn';
import { useProjectAnnotationStyles } from '../../../hooks/use-project-annotation-styles';
import UnlockSmileyIcon from '../../../../shared/icons/UnlockSmileyIcon';
import { useCurrentUser } from '../../../../shared/hooks/use-current-user';
import { ManifestSnippet } from '../../../../shared/features/ManifestSnippet';
import { ReviewNavigation } from './ReviewNagivation';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';

const ReviewContainer = styled.div`
  position: relative;
  overflow-x: hidden;
  height: 80vh;
  display: flex;
  flex-direction: column;

  &[data-is-max-window='true'] {
    height: 100vh;

    ${CanvasViewerControls} {
      top: 9em;
    }
  }
`;

const ReviewHeader = styled.div`
  height: 43px;
  background-color: #f7f7f7;
  display: flex;
  border-bottom: 1px solid #dddddd;
  line-height: 24px;
  position: sticky;
  top: 0;
  z-index: 12;
`;

const Label = styled.div`
  font-weight: 600;
  padding: 0.6em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubLabel = styled.div`
  color: #6b6b6b;
  padding: 0.6em;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 130px;
`;
const ReviewActionBar = styled.div`
  border-bottom: 1px solid #dddddd;
  display: inline-flex;
  justify-content: space-between;
  flex-wrap: wrap-reverse;
  width: 100%;
  padding: 0.6em;
  min-height: 42px;
  overflow: auto;
`;

const ReviewActionMessage = styled.div`
  background-color: rgba(0, 92, 197, 0.15);
  padding: 0.5em;
  border-radius: 4px;
  font-size: small;
`;

const ReviewActions = styled.div`
  display: flex;
  margin-left: auto;

  button {
    border: none;
  }
`;

const ReviewDropdownContainer = styled.div`
  position: relative;
  max-width: 150px;
  align-self: end;
  z-index: 11;
`;

const ReviewDropdownPopup = styled.div<{ $visible?: boolean }>`
  background: #ffffff;
  border: 1px solid #3498db;
  z-index: 11;
  border-radius: 4px;
  position: absolute;
  display: none;
  margin: 0.3em;
  top: 2.6em;
  right: 0;
  font-size: 0.9em;
  min-width: 10em;
  ${props =>
    props.$visible &&
    css`
      display: block;
    `}
`;

const ReviewPreview = styled.div`
  display: flex;
  overflow-y: scroll;
  flex-wrap: wrap;
  flex: 1;

  > div {
    padding: 0.6em;
    width: auto;
  }
`;

const Assignee = styled.div`
  font-size: small;
  color: #575757;
  align-self: center;
  margin-left: 0.5em;
  min-width: 200px;
`;

function ViewSingleReview({
  task,
  taskId,
  review,
  toggle,
  isOpen,
}: {
  task: CrowdsourcingTask & { id: string };
  taskId?: string;
  review: (CrowdsourcingReview & { id: string }) | null;
  toggle: any;
  isOpen: boolean;
}) {
  const { captureModel, revisionId, wasRejected, canvas, project, canvasLink, editLink, manifestLink } =
    useCrowdsourcingTaskDetails(task);

  const refetch = useRefetch();
  const createLink = useRelativeLinks();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);
  const [isEditing, setIsEditing] = useState(false);
  // const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const user = useCurrentUser(true);

  const limitedReviewer =
    user && user.scope && user.scope.indexOf('models.revision') !== -1 && user.scope.indexOf('models.create') === -1;
  const reviewer =
    user &&
    user.scope &&
    (user.scope.indexOf('models.revision') !== -1 ||
      user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1);

  const canReview = limitedReviewer ? review?.assignee?.id === user.user?.id : reviewer;
  const isDone = task?.status === 3;
  const { buttonProps, isOpen: isDropdownOpen } = useDropdownMenu(1, {
    disableFocusFirstItemOnClick: true,
  });
  const { t } = useTranslation();
  const gridRef = useRef<any>();
  const runtime = useRef<Runtime>();
  const annotationTheme = useProjectAnnotationStyles();
  const api = useApi();
  const [unassignUser] = useMutation(
    async () => {
      if (task) {
        await api.updateTask(task.id, { status: -1, status_text: 'unassigned' });
        await refetch();
      }
    },
    {
      throwOnError: true,
    }
  );

  const [manualReview, manualReviewData] = useMutation(
    async () => {
      if (task) {
        const assignee = task.assignee ? task.assignee.id : undefined;
        if (!assignee) throw new Error('No assignee');
        const assigneeId = parseUrn(assignee)?.id;
        if (!assigneeId) throw new Error('No assignee');

        const isCanvas = task.metadata?.subject?.type === 'canvas';
        const isManifest = task.metadata?.subject?.type === 'manifest';
        const canvasId = task.metadata?.subject.id;
        const manifestId = task.metadata?.subject?.parent?.id;
        const projectId = project?.id;

        if (!projectId) throw new Error('No project');
        if (!manifestId) throw new Error('No manifest');
        if (!canvasId) throw new Error('No canvas');
        if (isManifest) {
          throw new Error('Manifest not supported yet');
        }
        if (!isCanvas) throw new Error('Not a canvas');

        await api.createResourceClaim(projectId, {
          revisionId,
          manifestId,
          canvasId,
          status: 2,
          userId: assigneeId,
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await refetch();
      }
    },
    { throwOnError: false }
  );

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
  };

  if (!review) {
    if (task.status === -1) {
      // Task has been rejected
      return (
        <>
          <ReviewHeader>
            <Label>
              {metadata && metadata.subject ? <LocaleString>{metadata.subject.label}</LocaleString> : task.name}
            </Label>

            <SubLabel>
              {metadata.subject && metadata.subject.parent && (
                <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {metadata.subject.parent.label}
                </LocaleString>
              )}
            </SubLabel>

            <ReviewNavigation taskId={taskId} />
          </ReviewHeader>
          <EmptyState>
            <CloseIcon />
            {t('This task has been rejected.')}
            <div>
              <HrefLink
                href={createLink({
                  taskId: task.id,
                  subRoute: 'tasks',
                  query: { type: 'crowdsourcing-task' },
                })}
              >
                {t('View task')}
              </HrefLink>
            </div>
          </EmptyState>
        </>
      );
    }

    return (
      <>
        <ReviewHeader>
          <Label>
            {metadata && metadata.subject ? <LocaleString>{metadata.subject.label}</LocaleString> : task.name}
          </Label>

          <SubLabel>
            {metadata.subject && metadata.subject.parent && (
              <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {metadata.subject.parent.label}
              </LocaleString>
            )}
          </SubLabel>

          <ReviewNavigation taskId={taskId} />
        </ReviewHeader>
        <EmptyState>
          <UnlockSmileyIcon />
          {t('This task is not yet ready for review.')}
          <span>{t('This means this task has been assigned or is in progress, but nothing has been submitted')}</span>
          <br />

          {manualReviewData.isError ? (
            <div>
              <ErrorMessage>
                <strong>{t('There was an error trying to put this task into review')}</strong> <br />{' '}
                {(manualReviewData.error as any).message}
              </ErrorMessage>
            </div>
          ) : null}

          <ButtonRow $center>
            <Button onClick={() => unassignUser()}>{t('Unassign from user')}</Button>
            {task.state.revisionId ? (
              <>
                <Button onClick={() => manualReview()}>{t('Manually put into review')}</Button>
                {editLink ? (
                  <Button as={HrefLink} href={editLink}>
                    {t('View submission')}
                  </Button>
                ) : null}
              </>
            ) : null}
          </ButtonRow>
        </EmptyState>
      </>
    );
  }

  return (
    <RevisionProviderWithFeatures
      revision={revisionId}
      captureModel={captureModel}
      features={{
        autosave: false,
        autoSelectingRevision: true,
        revisionEditMode: false,
        directEdit: true,
      }}
      slotConfig={{
        editor: { allowEditing: isEditing, deselectRevisionAfterSaving: false, saveOnNavigate: false },
        components: { SubmitButton: DirectEditButton },
      }}
      annotationTheme={annotationTheme}
    >
      <ReviewContainer id={'review-container'} data-is-max-window={isOpen}>
        <ReviewHeader>
          <Label>
            {metadata && metadata.subject ? <LocaleString>{metadata.subject.label}</LocaleString> : task.name}
          </Label>

          <SubLabel>
            {metadata.subject && metadata.subject.parent && (
              <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {metadata.subject.parent.label}
              </LocaleString>
            )}
          </SubLabel>

          <ReviewNavigation taskId={taskId} />
        </ReviewHeader>
        <ReviewActionBar>
          <div style={{ display: 'flex' }}>
            <SimpleStatus status={task.status} status_text={task.status_text || ''} />
            {task.assignee && (
              <Assignee>
                {t('assigned to')}:{' '}
                <HrefLink href={`/users/${extractIdFromUrn(task.assignee.id)}`}>{task.assignee.name}</HrefLink>
              </Assignee>
            )}
          </div>
          {review && !wasRejected && canReview ? (
            <ReviewActions>
              <RejectSubmission
                userTaskId={task.id}
                onReject={() => {
                  refetch();
                }}
              />

              <EditorToolbarButton onClick={() => setIsEditing(r => !r)} disabled={isDone}>
                <EditorToolbarIcon>
                  <EditIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>{isEditing ? t('Exit Correction') : t('Make Correction')}</EditorToolbarLabel>
              </EditorToolbarButton>

              <RequestChanges
                userTaskId={task.id}
                changesRequested={task.state?.changesRequested}
                onRequest={() => {
                  refetch();
                }}
              />

              {/*<StartMerge*/}
              {/*  allTasks={props.allTasks as any}*/}
              {/*  reviewTaskId={data.review.id}*/}
              {/*  userTask={task}*/}
              {/*  // onStartMerge={(revId: string) => props.goBack({ refresh: true, revisionId: revId })}*/}
              {/*/>*/}

              <ApproveSubmission
                project={project}
                userTaskId={task.id}
                onApprove={async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await refetch();
                }}
                reviewTaskId={review.id}
              />
            </ReviewActions>
          ) : !isDone || !wasRejected ? (
            <ReviewActionMessage>
              {t('You do not have the correct permissions to review this task')}
            </ReviewActionMessage>
          ) : null}
        </ReviewActionBar>
        <ReviewPreview>
          <div style={{ flexGrow: 1, maxWidth: 300, overflowX: 'scroll' }}>
            <CanvasViewerEditorStyleReset>
              <EditorSlots.TopLevelEditor />
            </CanvasViewerEditorStyleReset>
            <EditorSlots.SubmitButton captureModel={captureModel} />
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
            <ReviewDropdownContainer>
              <Button $link {...buttonProps}>
                {t('View options')}
              </Button>
              <ReviewDropdownPopup $visible={isDropdownOpen} role="menu">
                <>
                  <EditorToolbarButton onClick={toggle} style={{ width: '100%' }}>
                    <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                    <EditorToolbarLabel> {isOpen ? 'List mode' : 'Focus mode'} </EditorToolbarLabel>
                  </EditorToolbarButton>
                  {canvasLink ? (
                    <EditorToolbarButton as={HrefLink} href={canvasLink}>
                      <EditorToolbarIcon>
                        <PreviewIcon />
                      </EditorToolbarIcon>
                      <EditorToolbarLabel>{t('View resource')}</EditorToolbarLabel>
                    </EditorToolbarButton>
                  ) : null}
                  {manifestLink ? (
                    <EditorToolbarButton as={HrefLink} href={manifestLink}>
                      <EditorToolbarIcon>
                        <PreviewIcon />
                      </EditorToolbarIcon>
                      <EditorToolbarLabel>{t('View manifest')}</EditorToolbarLabel>
                    </EditorToolbarButton>
                  ) : null}
                </>
              </ReviewDropdownPopup>
            </ReviewDropdownContainer>

            {canvas ? (
              <CanvasViewerGrid ref={gridRef}>
                <EditorContentViewer
                  height={'100%' as any}
                  canvasId={canvas.id}
                  onCreated={rt => {
                    return ((runtime as any).current = rt.runtime);
                  }}
                />
                {isOpen && (
                  <CanvasViewerControls>
                    <CanvasViewerButton onClick={goHome}>
                      <HomeIcon title={t('atlas__zoom_home', { defaultValue: 'Home' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomOut}>
                      <MinusIcon title={t('atlas__zoom_out', { defaultValue: 'Zoom out' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomIn}>
                      <PlusIcon title={t('atlas__zoom_in', { defaultValue: 'Zoom in' })} />
                    </CanvasViewerButton>
                  </CanvasViewerControls>
                )}
              </CanvasViewerGrid>
            ) : (
              metadata.subject?.id &&
              metadata.subject.type === 'manifest' && (
                <>
                  <ManifestSnippet
                    id={metadata.subject?.id}
                    data-is-stacked={true}
                    data-is-flatd={true}
                    data-is-portrait={true}
                    hideButton
                  />
                </>
              )
            )}
          </div>
        </ReviewPreview>
      </ReviewContainer>
    </RevisionProviderWithFeatures>
  );
}

export function SingleReview() {
  const params = useParams<{ taskId: string }>();
  const { data, refetch, updatedAt } = useData(SingleReview);

  return (
    <MaximiseWindow>
      {({ toggle, isOpen }) => {
        if (!data) {
          return <EmptyState>Loading...</EmptyState>;
        } else
          return (
            <RefetchProvider refetch={refetch}>
              <ViewSingleReview
                key={updatedAt}
                taskId={params.taskId}
                task={data.task}
                review={data.review}
                toggle={toggle}
                isOpen={isOpen}
              />
            </RefetchProvider>
          );
      }}
    </MaximiseWindow>
  );
}

serverRendererFor(SingleReview, {
  getKey: params => {
    return ['single-review', { id: params.taskId }];
  },
  async getData(key, vars, api) {
    const task = await api.getTask(vars.id);
    if (!task || !task.state || !task.state.reviewTask) {
      return {
        review: null,
        task,
      };
    }
    return {
      review: await api.getTask(task.state.reviewTask),
      task,
    };
  },
});
