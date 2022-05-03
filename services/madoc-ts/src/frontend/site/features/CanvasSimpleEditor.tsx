import { Runtime } from '@atlas-viewer/atlas';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PARAGRAPHS_PROFILE } from '../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { slotConfig } from '../../../extensions/capture-models/Paragraphs/Paragraphs.slots';
import { SubmitWithoutPreview } from '../../shared/capture-models/new/components/SubmitWithoutPreview';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useReadOnlyAnnotations } from '../../shared/hooks/use-read-only-annotations';
import { HomeIcon } from '../../shared/icons/HomeIcon';
import { MinusIcon } from '../../shared/icons/MinusIcon';
import { PlusIcon } from '../../shared/icons/PlusIcon';
import { ButtonIcon } from '../../shared/navigation/Button';
import { EmptyState } from '../../shared/layout/EmptyState';
import { SmallToast } from '../../shared/callouts/SmallToast';
import { TickIcon } from '../../shared/icons/TickIcon';
import { BackToChoicesButton } from '../../shared/capture-models/new/components/BackToChoicesButton';
import { DirectEditButton } from '../../shared/capture-models/new/components/DirectEditButton';
import { EditorRenderingConfig, EditorSlots } from '../../shared/capture-models/new/components/EditorSlots';
import {
  RevisionProviderFeatures,
  RevisionProviderWithFeatures,
} from '../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { SegmentationFieldInstance } from '../../shared/capture-models/new/components/SegmentationFieldInstance';
import { SegmentationInlineEntity } from '../../shared/capture-models/new/components/SegmentationInlineEntity';
import { SegmentationInlineProperties } from '../../shared/capture-models/new/components/SegmentationInlineProperties';
import { SimpleSaveButton } from '../../shared/capture-models/new/components/SimpleSaveButton';
import { EditorContentViewer } from '../../shared/capture-models/new/EditorContent';
import { CanvasVaultContext } from '../../shared/components/CanvasVaultContext';
import { useApi } from '../../shared/hooks/use-api';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { isEditingAnotherUsersRevision } from '../../shared/utility/is-editing-another-users-revision';
import { useCanvasModel } from '../hooks/use-canvas-model';
import { useCanvasUserTasks } from '../hooks/use-canvas-user-tasks';
import { useContributionMode } from '../hooks/use-contribution-mode';
import { useProjectAnnotationStyles } from '../hooks/use-project-annotation-styles';
import { useProjectStatus } from '../hooks/use-project-status';
import { RouteContext, useRouteContext } from '../hooks/use-route-context';
import { CanvasHighlightedRegions } from './CanvasHighlightedRegions';
import { CanvasModelUserStatus } from './CanvasModelUserStatus';
import { CanvasViewer } from './CanvasViewer';
import {
  CanvasViewerButton,
  CanvasViewerContentOverlay,
  CanvasViewerControls,
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
} from './CanvasViewerGrid';
import { useSiteConfiguration } from './SiteConfigurationContext';
import { TranscriberModeWorkflowBar } from './TranscriberModeWorkflowBar';
import { useModelPageConfiguration } from '../hooks/use-model-page-configuration';

export const CanvasSimpleEditor: React.FC<{ revision: string; isComplete?: boolean; isSegmentation?: boolean }> = ({
  revision,
  isSegmentation,
}) => {
  const { t } = useTranslation();
  const { projectId, canvasId } = useRouteContext();
  const { data: projectModel } = useCanvasModel();
  const [{ captureModel }] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);
  const { updateClaim, allTasksDone, markedAsUnusable } = useCanvasUserTasks();
  const { isPreparing } = useProjectStatus();
  const annotationTheme = useProjectAnnotationStyles();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const {
    disableSaveForLater = false,
    disablePreview = false,
    disableNextCanvas = false,
  } = useModelPageConfiguration();
  const mode = useContributionMode();
  const isVertical = config.project.defaultEditorOrientation === 'vertical';
  const api = useApi();
  const runtime = useRef<Runtime>();
  const gridRef = useRef<any>();
  const [height, setHeight] = useState(600);
  const [showPanWarning, setShowPanWarning] = useLocalStorage('pan-warning', false);
  const [postSubmission, setPostSubmission] = useState(false);
  const [postSubmissionMessage, setPostSubmissionMessage] = useState(false);
  const readOnlyAnnotations = useReadOnlyAnnotations(true);

  useEffect(() => {
    setPostSubmission(false);
    setPostSubmissionMessage(false);
  }, [revision, canvasId]);

  useLayoutEffect(() => {
    if (gridRef.current) {
      const bounds = gridRef.current.getBoundingClientRect();
      if (bounds.height) {
        setHeight(bounds.height);
      }
    }
  }, []);

  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;
  const hideViewerControls = !!config.project.modelPageOptions?.hideViewerControls;
  const preventFurtherSubmission = !allowMultiple && allTasksDone;

  const isEditing = isEditingAnotherUsersRevision(captureModel, revision, user.user);

  const onPanInSketchMode = useCallback(() => {
    setShowPanWarning(true);
    setTimeout(() => {
      setShowPanWarning(false);
    }, 3000);
  }, []);

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

  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  const isModelAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.admin') !== -1);

  const features: RevisionProviderFeatures = isPreparing
    ? {
        autosave: false,
        autoSelectingRevision: true,
        revisionEditMode: false,
        directEdit: true,
      }
    : {
        preventMultiple: !allowMultiple,
      };

  const components: Partial<EditorRenderingConfig> = isPreparing
    ? {
        SubmitButton: DirectEditButton,
        FieldInstance: isSegmentation ? SegmentationFieldInstance : undefined,
        InlineEntity: isSegmentation ? SegmentationInlineEntity : undefined,
        InlineProperties: isSegmentation ? SegmentationInlineProperties : undefined,
      }
    : isEditing || mode === 'transcription'
    ? {
        SubmitButton: SimpleSaveButton,
      }
    : disablePreview
    ? {
        SubmitButton: SubmitWithoutPreview,
      }
    : {};

  const profileConfig: { [key: string]: Partial<EditorRenderingConfig> } = {
    [PARAGRAPHS_PROFILE]: slotConfig,
  };

  async function onAfterSave(ctx: { revisionRequest: RevisionRequest; context: RouteContext }) {
    if (!isEditing && !isPreparing) {
      await updateClaim(ctx);
    }

    // If we have disabled preview, we need to show the post-submission.
    if (disablePreview && ctx.revisionRequest.revision.status !== 'draft') {
      if (disableNextCanvas) {
        setPostSubmissionMessage(true);
      } else {
        setPostSubmission(true);
      }
    }
  }

  if (api.getIsServer() || !canvasId || !projectId || (isPreparing && !isModelAdmin)) {
    return null;
  }

  return (
    <CanvasVaultContext>
      <RevisionProviderWithFeatures
        features={features}
        key={revision}
        revision={isSegmentation ? undefined : revision}
        captureModel={captureModel}
        slotConfig={{
          editor: {
            allowEditing: !preventFurtherSubmission,
            deselectRevisionAfterSaving: true,
            profileConfig,
            saveOnNavigate: isPreparing || mode === 'transcription',
            disableSaveForLater,
          },
          components: components,
        }}
        annotationTheme={annotationTheme}
      >
        {!isPreparing && mode === 'transcription' ? <TranscriberModeWorkflowBar /> : null}

        <CanvasViewer>
          <CanvasHighlightedRegions />

          <CanvasViewerGrid $vertical={isVertical} ref={gridRef}>
            <CanvasViewerGridContent $vertical={isVertical}>
              <EditorContentViewer
                height={height}
                canvasId={canvasId}
                onCreated={rt => {
                  return ((runtime as any).current = rt.runtime);
                }}
                onPanInSketchMode={onPanInSketchMode}
              >
                {readOnlyAnnotations.map(anno => (
                  <box key={anno.id} {...anno} />
                ))}
              </EditorContentViewer>

              {hideViewerControls ? null : (
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

              <CanvasViewerContentOverlay>
                <SmallToast $active={showPanWarning}>{t('Hold space to pan and zoom')}</SmallToast>
              </CanvasViewerContentOverlay>
            </CanvasViewerGridContent>

            <CanvasViewerGridSidebar $vertical={isVertical}>
              {postSubmissionMessage ? (
                <div>
                  <EditorSlots.PostSubmission stacked messageOnly onContinue={() => setPostSubmissionMessage(false)} />
                </div>
              ) : null}
              <CanvasModelUserStatus isEditing={isEditing} />
              {preventFurtherSubmission ? (
                <>
                  <EmptyState style={{ fontSize: '1.25em' }} $box>
                    <ButtonIcon>
                      <TickIcon />
                    </ButtonIcon>
                    <strong>{t('Task is complete!')}</strong>
                  </EmptyState>
                  <EmptyState>
                    {markedAsUnusable
                      ? t('You have marked this as unusable')
                      : t(
                          'Thank you for your submission. You can view your contribution in the left sidebar. You can continue working on another canvas'
                        )}
                  </EmptyState>
                </>
              ) : postSubmission ? (
                <div>
                  <EditorSlots.PostSubmission stacked onContinue={() => setPostSubmission(false)} />
                </div>
              ) : canContribute && captureModel ? (
                <>
                  <BackToChoicesButton />

                  <CanvasViewerEditorStyleReset>
                    <EditorSlots.TopLevelEditor />
                  </CanvasViewerEditorStyleReset>

                  <EditorSlots.SubmitButton afterSave={onAfterSave} />
                </>
              ) : (
                <EmptyState>{t('Loading your model')}</EmptyState>
              )}
            </CanvasViewerGridSidebar>
          </CanvasViewerGrid>
        </CanvasViewer>
      </RevisionProviderWithFeatures>
    </CanvasVaultContext>
  );
};
