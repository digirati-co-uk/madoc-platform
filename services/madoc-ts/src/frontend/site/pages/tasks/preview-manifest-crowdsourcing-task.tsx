import React, { useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { defaultTheme } from '../../../shared/capture-models/editor/themes';
import { DirectEditButton } from '../../../shared/capture-models/new/components/DirectEditButton';
import { EditorSlots } from '../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { Revisions } from '../../../shared/capture-models/editor/stores/revisions';
import { useApi } from '../../../shared/hooks/use-api';
import { useApiTask } from '../../../shared/hooks/use-api-task';
import { useProjectTemplate } from '../../../shared/hooks/use-project-template';
import { useSite } from '../../../shared/hooks/use-site';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { EditIcon } from '../../../shared/icons/EditIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { PreviewIcon } from '../../../shared/icons/PreviewIcon';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { MaximiseWindow } from '../../../shared/layout/MaximiseWindow';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/navigation/EditorToolbar';
import {
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
} from '../../../shared/atoms/CanvasViewerGrid';
import { useCrowdsourcingTaskDetails } from '../../hooks/use-crowdsourcing-task-details';
import { ApproveSubmission } from './actions/approve-submission';
import { RejectSubmission } from './actions/reject-submission';
import { RequestChanges } from './actions/request-changes';
import { ReviewRendererContextProvider } from './review-renderers/review-renderer-context';
import {
  CustomReviewRendererProps,
  getReviewRendererMode,
  ReviewDefaultControlsComponent,
} from './review-renderers/types';

export function PreviewManifestCrowdsourcingTask(props: {
  task: CrowdsourcingTask & { id: string };
  reviewTaskId: string;
  allRevisionIds: string[];
  allTaskIds: string[];
  lockedTasks?: string[];
  allTasks: Array<CrowdsourcingTask>;
  goBack: (p?: { refresh?: boolean; revisionId?: string }) => void | Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: taskData } = useApiTask<CrowdsourcingTask>(props.task.id);
  const gridRef = useRef<any>();
  const { captureModel, project, modelStatus } = useCrowdsourcingTaskDetails(props.task);
  const isLocked = props.lockedTasks && props.lockedTasks.indexOf(props.task.id) !== -1;
  const isDone = taskData?.status === 3;
  const api = useApi();
  const site = useSite();
  const template = useProjectTemplate(project?.template);
  const CustomReviewRenderer = template?.components?.customReviewRenderer as React.FC<CustomReviewRendererProps> | undefined;

  const DefaultControls: ReviewDefaultControlsComponent = () => {
    return (
      <>
        <EditorToolbarButton onClick={() => setIsEditing(r => !r)} disabled={isLocked || !!isDone}>
          <EditorToolbarIcon>{isEditing ? <PreviewIcon /> : <EditIcon />}</EditorToolbarIcon>
          <EditorToolbarLabel>{isEditing ? 'preview submission' : 'edit submission'}</EditorToolbarLabel>
        </EditorToolbarButton>

        {isLocked || isDone ? null : (
          <>
            <RejectSubmission userTaskId={props.task.id} onReject={() => props.goBack({ refresh: true })} />

            <RequestChanges
              userTaskId={props.task.id}
              changesRequested={props.task.state?.changesRequested}
              onRequest={() => props.goBack({ refresh: true })}
            />

            <ApproveSubmission
              project={project}
              userTaskId={props.task.id}
              allRevisionIds={props.allRevisionIds}
              allUserTaskIds={props.allTaskIds}
              onApprove={() => props.goBack({ refresh: true })}
              reviewTaskId={props.reviewTaskId}
            />
          </>
        )}
      </>
    );
  };

  const reviewContextBase = {
    task: props.task,
    review: null,
    project,
    mode: getReviewRendererMode(isEditing),
    isEditing,
    setIsEditing,
    isDone: !!isDone,
    isLocked: !!isLocked,
    canReview: !isLocked && !isDone,
    wasRejected: props.task.status === -1,
    subjectType: 'manifest' as const,
    assigneeName: props.task.assignee?.name,
    reviewAssigneeName: undefined,
  };

  const ReviewContextWithActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
              if (!currentRevision || isLocked || isDone) {
                return;
              }
              await api.reviewRejectSubmission({
                revisionRequest: currentRevision,
                userTaskId: props.task.id,
                message: '',
              });
              deselectRevision({ revisionId: currentRevision.revision.id });
              await props.goBack({ refresh: true });
            },
            requestChanges: async () => {
              if (!currentRevision || isLocked || isDone) {
                return;
              }
              await api.reviewRequestChanges({
                message: props.task.state?.changesRequested || '',
                revisionRequest: currentRevision,
                userTaskId: props.task.id,
              });
              deselectRevision({ revisionId: currentRevision.revision.id });
              await props.goBack({ refresh: true });
            },
            approve: async () => {
              if (!currentRevision || isLocked || isDone) {
                return;
              }
              const definition =
                project && project.template ? api.projectTemplates.getDefinition(project.template, site.id) : null;
              await api.crowdsourcing.reviewApproveSubmission({
                revisionRequest: currentRevision,
                userTaskId: props.task.id,
                projectTemplate:
                  definition && project
                    ? {
                        template: definition,
                        config: project.template_config,
                      }
                    : undefined,
              });
              await props.goBack({ refresh: true });
            },
            toggleEditing: () => setIsEditing(r => !r),
            startMerge: async () => undefined,
          },
        }}
      >
        {children}
      </ReviewRendererContextProvider>
    );
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {isLocked ? <WarningMessage>This task is locked, there is a merge in progress</WarningMessage> : null}
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <RevisionProviderWithFeatures
              captureModel={captureModel}
              key={taskData?.state.revisionId}
              revision={taskData?.state.revisionId}
              features={{
                autosave: false,
                autoSelectingRevision: true,
                revisionEditMode: false,
                directEdit: true,
              }}
              slotConfig={{
                editor: {
                  allowEditing: isEditing,
                  deselectRevisionAfterSaving: false,
                  saveOnNavigate: false,
                },
                components: {
                  SubmitButton: DirectEditButton,
                },
              }}
            >
              <ReviewContextWithActions>
                <EditorToolbarContainer>
                  <EditorToolbarButton onClick={() => props.goBack()}>
                    <EditorToolbarIcon>
                      <ArrowBackIcon />
                    </EditorToolbarIcon>
                  </EditorToolbarButton>
                  <EditorToolbarTitle>{taskData?.assignee?.name}</EditorToolbarTitle>

                  <EditorToolbarSpacer />
                  {!CustomReviewRenderer ? <DefaultControls /> : null}

                  <EditorToolbarButton onClick={toggle}>
                    <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                  </EditorToolbarButton>
                </EditorToolbarContainer>

                {CustomReviewRenderer ? (
                  <CustomReviewRenderer
                    mode={getReviewRendererMode(isEditing)}
                    subjectType="manifest"
                    viewer={
                      <CanvasViewerGridContent>
                        <MetadataEmptyState>No preview</MetadataEmptyState>
                      </CanvasViewerGridContent>
                    }
                    saveControl={<EditorSlots.SubmitButton captureModel={captureModel} />}
                    controls={<DefaultControls compact />}
                    DefaultControls={DefaultControls}
                  />
                ) : (
                  <CanvasViewerGrid ref={gridRef}>
                    <CanvasViewerGridContent>
                      <MetadataEmptyState>No preview</MetadataEmptyState>
                    </CanvasViewerGridContent>
                    <CanvasViewerGridSidebar>
                      <CanvasViewerEditorStyleReset>
                        <EditorSlots.TopLevelEditor />
                      </CanvasViewerEditorStyleReset>

                      <EditorSlots.SubmitButton captureModel={captureModel} />
                    </CanvasViewerGridSidebar>
                  </CanvasViewerGrid>
                )}
              </ReviewContextWithActions>
            </RevisionProviderWithFeatures>
          ) : (
            <>
              <EditorToolbarContainer>
                <EditorToolbarButton onClick={() => props.goBack()}>
                  <EditorToolbarIcon>
                    <ArrowBackIcon />
                  </EditorToolbarIcon>
                </EditorToolbarButton>
                <EditorToolbarTitle>{taskData?.assignee?.name}</EditorToolbarTitle>
              </EditorToolbarContainer>

              {modelStatus === 'error' ? (
                <ErrorMessage $banner>Model not found</ErrorMessage>
              ) : (
                <EmptyState>loading...</EmptyState>
              )}
            </>
          )
        }
      </MaximiseWindow>
    </ThemeProvider>
  );
}
