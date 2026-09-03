import React, { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { CrowdsourcingReview } from '../../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { EditorContentViewer } from '../../../../shared/capture-models/new/EditorContent';
import {
  CanvasViewerButton,
  CanvasViewerControls,
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
} from '../../../../shared/atoms/CanvasViewerGrid';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useSite } from '../../../../shared/hooks/use-site';
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
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
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
import { RotateIcon } from '../../../../shared/icons/RotateIcon';
import { ArrowBackIcon } from '../../../../shared/icons/ArrowBackIcon';
import { useTranslation } from 'react-i18next';
import { extractIdFromUrn, parseUrn } from '../../../../../utility/parse-urn';
import { useProjectAnnotationStyles } from '../../../hooks/use-project-annotation-styles';
import UnlockSmileyIcon from '../../../../shared/icons/UnlockSmileyIcon';
import { useCurrentUser } from '../../../../shared/hooks/use-current-user';
import { ManifestSnippet } from '../../../../shared/features/ManifestSnippet';
import { ReviewNavigation } from './ReviewNagivation';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions';
import { ReviewRendererContextProvider } from '../review-renderers/review-renderer-context';
import {
  CustomReviewRendererProps,
  getReviewRendererMode,
  ReviewDefaultControlsComponent,
} from '../review-renderers/types';
import { useModelPageConfiguration } from '../../../hooks/use-model-page-configuration';
import { OpenSeadragonViewer } from '../../../../shared/features/OpenSeadragonViewer.lazy';
import { BrowserComponent } from '../../../../shared/utility/browser-component';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';
import { CanvasViewer as ReviewCanvasViewer } from '../../../../shared/components/StandaloneCanvasViewer';
import { HorizontalEditorSplit } from '../../../../shared/components/HorizontalEditorSplit';

function ReviewContainer(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className="relative flex h-[80vh] flex-col overflow-x-hidden data-[is-max-window=true]:h-screen" />
  );
}

function ReviewHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="sticky top-0 z-[12] flex h-12 items-center border-b border-[#ddd] bg-[#f7f7f7] leading-6"
    />
  );
}

function Label(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="overflow-hidden text-ellipsis whitespace-nowrap p-[0.6em] font-semibold" />;
}

function SubLabel(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="mr-[130px] overflow-hidden text-ellipsis whitespace-nowrap p-[0.6em] text-sm text-[#6b6b6b]"
    />
  );
}

function ReviewActionBar(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="inline-flex min-h-[42px] w-full flex-wrap-reverse justify-between overflow-visible border-b border-[#ddd] p-[0.6em]"
    />
  );
}

function ReviewActionMessage(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="rounded bg-[rgba(0,92,197,0.15)] p-[0.5em] text-sm" />;
}

function ReviewActions(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="ml-auto flex [&_button]:border-0" />;
}

function ReviewActionControls(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="ml-auto flex items-center gap-[0.5em]" />;
}

function ReviewDropdownContainer(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="relative z-30 max-w-[150px] self-end" />;
}

function ReviewDropdownPopup({ $visible, ...props }: React.HTMLAttributes<HTMLDivElement> & { $visible?: boolean }) {
  return (
    <div
      {...props}
      className={`${$visible ? 'block' : 'hidden'} absolute right-0 top-[2.6em] z-[31] m-[0.3em] min-w-[10em] rounded border border-[#3498db] bg-white text-[0.9em]`}
    />
  );
}

function Assignee(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className="ml-[0.5em] min-w-[200px] self-center text-sm text-[#575757]" />;
}

type ViewOptionsDropdownProps = {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  canvasLink?: string;
  manifestLink?: string;
  hideFocusMode?: boolean;
};

function ViewOptionsDropdown({
  isFullscreen,
  onToggleFullscreen,
  canvasLink,
  manifestLink,
  hideFocusMode = false,
}: ViewOptionsDropdownProps) {
  const { t } = useTranslation();
  const menuItemCount = (hideFocusMode ? 0 : 1) + (canvasLink ? 1 : 0) + (manifestLink ? 1 : 0);
  const { buttonProps, isOpen: isDropdownOpen } = useDropdownMenu(Math.max(menuItemCount, 1), {
    disableFocusFirstItemOnClick: true,
  });

  if (!menuItemCount) {
    return null;
  }

  return (
    <ReviewDropdownContainer>
      <Button type="button" $link {...buttonProps}>
        {t('View options')}
      </Button>
      <ReviewDropdownPopup $visible={isDropdownOpen} role="menu">
        <>
          {/* Temporarily disabled on tabular reviews to prevent canvas flashing while the dropdown opens. */}
          {!hideFocusMode ? (
            <EditorToolbarButton type="button" onClick={onToggleFullscreen} style={{ width: '100%' }}>
              <EditorToolbarIcon>{isFullscreen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
              <EditorToolbarLabel> {isFullscreen ? 'List mode' : 'Focus mode'} </EditorToolbarLabel>
            </EditorToolbarButton>
          ) : null}
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
  );
}

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
  const { ...query } = useLocationQuery();
  const reviewListLink = createLink({ taskId: undefined, subRoute: 'reviews', query });
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);
  const [isEditing, setIsEditing] = useState(false);
  // const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const user = useCurrentUser(true);
  const scope = user?.scope || [];

  const limitedReviewer = scope.indexOf('models.revision') !== -1 && scope.indexOf('models.create') === -1;
  const reviewer =
    scope.indexOf('models.revision') !== -1 ||
    scope.indexOf('site.admin') !== -1 ||
    scope.indexOf('models.admin') !== -1;
  const canManageReviewOutcomes =
    scope.indexOf('site.admin') !== -1 || scope.indexOf('tasks.admin') !== -1 || scope.indexOf('models.admin') !== -1;

  const canReview = limitedReviewer ? review?.assignee?.id === user.user?.id : reviewer;
  const isDone = task?.status === 3;
  const { t } = useTranslation();
  const gridRef = useRef<any>(undefined);
  const runtime = useRef<Runtime>(undefined);
  const osd = useRef<any>(undefined);
  const [isOSD, setIsOSD] = useState(false);
  const { enableRotation = false, enableEditorResizing = true } = useModelPageConfiguration();
  const annotationTheme = useProjectAnnotationStyles();
  const api = useApi();
  const template = useProjectTemplate(project?.template);
  const CustomReviewRenderer = template?.components?.customReviewRenderer as
    React.FC<CustomReviewRendererProps> | undefined;

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
    if (osd.current) {
      osd.current.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
    if (osd.current) {
      osd.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
    if (osd.current) {
      osd.current.zoomOut();
    }
  };

  const rotate = () => {
    if (isOSD) {
      osd.current?.rotate();
    } else {
      setIsOSD(true);
    }
  };

  const DefaultReviewControls: ReviewDefaultControlsComponent = () => {
    if (!review || wasRejected || !canReview) {
      return !isDone || !wasRejected ? (
        <ReviewActionMessage>{t('You do not have the correct permissions to review this task')}</ReviewActionMessage>
      ) : null;
    }

    if (isDone) {
      return <ReviewActionMessage>{t('This review is complete')}</ReviewActionMessage>;
    }

    return (
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
    );
  };

  const backToReviewListButton = (
    <HrefLink
      href={reviewListLink}
      aria-label={t('Back to reviews list')}
      title={t('Back to reviews list')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        marginLeft: 4,
        color: '#333333',
      }}
    >
      <ArrowBackIcon aria-hidden="true" style={{ width: 18, height: 18, fill: 'currentColor' }} />
    </HrefLink>
  );

  if (!review) {
    if (task.status === -1) {
      // Task has been rejected
      return (
        <>
          <ReviewHeader>
            {backToReviewListButton}
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
          {backToReviewListButton}
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

          {!canManageReviewOutcomes ? (
            <ReviewActionMessage>
              {t('Only site admins can unassign tasks or force tasks into review.')}
            </ReviewActionMessage>
          ) : null}

          <ButtonRow $center>
            {canManageReviewOutcomes ? <Button onClick={() => unassignUser()}>{t('Unassign from user')}</Button> : null}
            {task.state.revisionId && canManageReviewOutcomes ? (
              <>
                <Button onClick={() => manualReview()}>{t('Manually put into review')}</Button>
              </>
            ) : null}
            {task.state.revisionId && editLink ? (
              <Button as={HrefLink} href={editLink}>
                {t('View submission')}
              </Button>
            ) : null}
          </ButtonRow>
        </EmptyState>
      </>
    );
  }

  const subjectType = metadata.subject?.type === 'manifest' ? 'manifest' : 'canvas';
  const isTabularProject = project?.template === 'tabular-project';
  const viewOptionsDropdown = (
    <ViewOptionsDropdown
      isFullscreen={isOpen}
      onToggleFullscreen={toggle}
      canvasLink={canvasLink || undefined}
      manifestLink={manifestLink || undefined}
      hideFocusMode={isTabularProject}
    />
  );

  const viewerNode = (
    <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
      {canvas ? (
        <CanvasViewerGrid ref={gridRef}>
          <CanvasViewerGridContent>
            {isOSD ? (
              <ReviewCanvasViewer canvas={canvas}>
                <InfoMessage
                  $small
                  style={{ lineHeight: '1.4em', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
                >
                  {t('You cannot edit annotations if you are rotating')}
                  <Button style={{ margin: '0.4em 0 0' }} onClick={() => setIsOSD(false)}>
                    Reset
                  </Button>
                </InfoMessage>
                <BrowserComponent fallback={null}>
                  <OpenSeadragonViewer ref={osd} onReady={viewer => viewer.viewport.setRotation(90)} />
                </BrowserComponent>
              </ReviewCanvasViewer>
            ) : (
              <EditorContentViewer
                height={'100%' as any}
                canvasId={canvas.id}
                onCreated={rt => {
                  return ((runtime as any).current = rt.runtime);
                }}
              />
            )}
            {(enableRotation || isOpen) && (
              <CanvasViewerControls style={isOSD ? { top: '4em' } : undefined}>
                {enableRotation ? (
                  <CanvasViewerButton onClick={rotate}>
                    <RotateIcon title={t('atlas__rotate', { defaultValue: 'Rotate' })} />
                  </CanvasViewerButton>
                ) : null}
                {isOpen ? (
                  <>
                    <CanvasViewerButton onClick={goHome}>
                      <HomeIcon title={t('atlas__zoom_home', { defaultValue: 'Home' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomOut}>
                      <MinusIcon title={t('atlas__zoom_out', { defaultValue: 'Zoom out' })} />
                    </CanvasViewerButton>
                    <CanvasViewerButton onClick={zoomIn}>
                      <PlusIcon title={t('atlas__zoom_in', { defaultValue: 'Zoom in' })} />
                    </CanvasViewerButton>
                  </>
                ) : null}
              </CanvasViewerControls>
            )}
          </CanvasViewerGridContent>
        </CanvasViewerGrid>
      ) : (
        metadata.subject?.id &&
        metadata.subject.type === 'manifest' && (
          <ManifestSnippet
            id={metadata.subject?.id}
            data-is-stacked={true}
            data-is-flatd={true}
            data-is-portrait={true}
            hideButton
          />
        )
      )}
    </div>
  );

  const reviewContextBase = {
    task,
    review,
    project,
    mode: getReviewRendererMode(isEditing),
    isEditing,
    setIsEditing,
    isDone,
    isLocked: false,
    canReview: !!canReview,
    wasRejected,
    subjectType,
    assigneeName: task.assignee?.name,
    reviewAssigneeName: review?.assignee?.name,
  } as const;

  const ReviewContextWithActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const site = useSite();
    const { currentRevision } = Revisions.useStoreState(state => {
      return {
        currentRevision: state.currentRevision,
      };
    });
    const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);

    return (
      <ReviewRendererContextProvider
        value={{
          ...reviewContextBase,
          actions: {
            reject: async () => {
              if (!currentRevision || !canReview || isDone) {
                return;
              }
              await api.reviewRejectSubmission({
                revisionRequest: currentRevision,
                userTaskId: task.id,
                message: '',
              });
              deselectRevision({ revisionId: currentRevision.revision.id });
              await refetch();
            },
            requestChanges: async () => {
              if (!currentRevision || !canReview || isDone) {
                return;
              }
              await api.reviewRequestChanges({
                revisionRequest: currentRevision,
                userTaskId: task.id,
                message: task.state?.changesRequested || '',
              });
              await refetch();
            },
            approve: async () => {
              if (!currentRevision || !canReview || !review || isDone) {
                return;
              }
              const definition =
                project && project.template ? api.projectTemplates.getDefinition(project.template, site.id) : null;
              await api.crowdsourcing.reviewApproveSubmission({
                revisionRequest: currentRevision,
                userTaskId: task.id,
                projectTemplate:
                  definition && project
                    ? {
                        template: definition,
                        config: project.template_config,
                      }
                    : undefined,
              });
              await new Promise(resolve => setTimeout(resolve, 1000));
              await refetch();
            },
            toggleEditing: () => setIsEditing(r => !r),
          },
        }}
      >
        {children}
      </ReviewRendererContextProvider>
    );
  };

  const reviewHeaderActions = (
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
      <ReviewActionControls>
        {viewOptionsDropdown}
        <DefaultReviewControls />
      </ReviewActionControls>
    </ReviewActionBar>
  );

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
      <ReviewContextWithActions>
        <ReviewContainer id={'review-container'} data-is-max-window={isOpen}>
          <ReviewHeader>
            {backToReviewListButton}
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

          {CustomReviewRenderer ? (
            <CustomReviewRenderer
              mode={getReviewRendererMode(isEditing)}
              subjectType={subjectType}
              viewer={viewerNode}
              saveControl={isEditing ? <EditorSlots.SubmitButton captureModel={captureModel} /> : null}
              controls={reviewHeaderActions}
              DefaultControls={DefaultReviewControls}
            />
          ) : (
            <>
              {reviewHeaderActions}
              <HorizontalEditorSplit
                name="non-tabular-single-review-editor"
                enabled={enableEditorResizing}
                resizableSide="left"
                defaultWidth={300}
                className="flex-1 overflow-y-auto p-[0.6em]"
                resizablePane={
                  <div className="h-full overflow-x-auto w-full">
                    <CanvasViewerEditorStyleReset>
                      <EditorSlots.TopLevelEditor />
                    </CanvasViewerEditorStyleReset>
                    <EditorSlots.SubmitButton captureModel={captureModel} />
                  </div>
                }
                flexiblePane={viewerNode}
              />
            </>
          )}
        </ReviewContainer>
      </ReviewContextWithActions>
    </RevisionProviderWithFeatures>
  );
}

export function SingleReview() {
  const params = useParams<{ taskId: string }>();
  const { data, refetch } = useData(SingleReview);

  return (
    <MaximiseWindow>
      {({ toggle, isOpen }) => {
        if (!data) {
          return <EmptyState>Loading...</EmptyState>;
        } else
          return (
            <RefetchProvider refetch={refetch}>
              <ViewSingleReview
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
