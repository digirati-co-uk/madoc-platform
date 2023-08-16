import { Runtime } from '@atlas-viewer/atlas';
import React, { useCallback, useReducer, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PARAGRAPHS_PROFILE } from '../../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { slotConfig } from '../../../../extensions/capture-models/Paragraphs/Paragraphs.slots';
import { AnnotationStyles } from '../../../../types/annotation-styles';
import { CanvasHighlightedRegions } from '../../../site/features/CanvasHighlightedRegions';
import { CanvasModelUserStatus } from '../../../site/features/contributor/CanvasModelUserStatus';
import { CanvasViewer, CanvasViewerProps } from '../../../site/features/CanvasViewer';
import {
  CanvasViewerButton,
  CanvasViewerContentOverlay,
  CanvasViewerControls,
  CanvasViewerEditorStyleReset,
  CanvasViewerGrid,
  CanvasViewerGridContent,
  CanvasViewerGridSidebar,
  ContributionSaveButton,
} from '../../atoms/CanvasViewerGrid';
import { CreateModelTestCase } from '../../../site/features/admin/CreateModelTestCase';
import { OpenSeadragonViewer } from '../../../site/features/OpenSeadragonViewer.lazy';
import { TranscriberModeWorkflowBar } from '../../../site/features/contributor/TranscriberModeWorkflowBar';
import { RouteContext } from '../../../site/hooks/use-route-context';
import { ViewReadOnlyAnnotation } from '../../atlas/ViewReadOnlyAnnotation';
import { InfoMessage } from '../../callouts/InfoMessage';
import { SmallToast } from '../../callouts/SmallToast';
import { useLocalStorage } from '../../hooks/use-local-storage';
import { ReadOnlyAnnotation } from '../../hooks/use-read-only-annotations';
import { HomeIcon } from '../../icons/HomeIcon';
import { MinusIcon } from '../../icons/MinusIcon';
import { PlusIcon } from '../../icons/PlusIcon';
import { RotateIcon } from '../../icons/RotateIcon';
import { TickIcon } from '../../icons/TickIcon';
import { EmptyState } from '../../layout/EmptyState';
import { Button, ButtonIcon } from '../../navigation/Button';
import { BrowserComponent } from '../../utility/browser-component';
import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { BackToChoicesButton } from './components/BackToChoicesButton';
import { DirectEditButton } from './components/DirectEditButton';
import { EditorRenderingConfig, EditorSlots } from './components/EditorSlots';
import { RevisionProviderFeatures, RevisionProviderWithFeatures } from './components/RevisionProviderWithFeatures';
import { SegmentationFieldInstance } from './components/SegmentationFieldInstance';
import { SegmentationInlineEntity } from './components/SegmentationInlineEntity';
import { SegmentationInlineProperties } from './components/SegmentationInlineProperties';
import { SimpleSaveButton } from './components/SimpleSaveButton';
import { SubmitWithoutPreview } from './components/SubmitWithoutPreview';
import { DynamicVaultContext } from './DynamicVaultContext';
import { EditorContentVariations, EditorContentViewer } from './EditorContent';

export interface CoreModelEditorProps {
  // Data
  revision?: string;
  captureModel?: CaptureModel;

  // Options
  isPreparing?: boolean;
  allowMultiple?: boolean;

  forkMode?: boolean;

  isSegmentation?: boolean;

  isEditing?: boolean;

  isVertical?: boolean;

  disablePreview?: boolean;

  preventFurtherSubmission?: boolean;

  disableSaveForLater?: boolean;

  disableNextCanvas?: boolean;

  markedAsUnusable?: boolean;

  enableCanvasUserStatus?: boolean;

  mode?: 'annotation' | 'transcription';

  annotationTheme?: AnnotationStyles['theme'];

  target: EditorContentVariations;

  readOnlyAnnotations?: ReadOnlyAnnotation[];

  hideViewerControls?: boolean;

  enableRotation?: boolean;

  canContribute?: boolean;

  // Actions.
  updateClaim: (ctx: { revisionRequest: RevisionRequest; context: RouteContext }) => void | Promise<void>;
  modelRefetch?: (args?: any) => Promise<void> | Promise<any>;

  enableHighlightedRegions?: boolean;

  components?: Partial<EditorRenderingConfig>;

  canvasViewerPins?: CanvasViewerProps['pins'];

  showBugReport?: boolean;
  children?: React.ReactNode;
}
export function CoreModelEditor({
  revision,
  captureModel,
  annotationTheme,
  disablePreview,
  isEditing,
  mode,
  isSegmentation,
  forkMode,
  isPreparing,
  allowMultiple,
  disableNextCanvas,
  disableSaveForLater,
  preventFurtherSubmission,
  isVertical,
  target: targetProps,
  readOnlyAnnotations,
  hideViewerControls,
  markedAsUnusable,
  enableRotation,
  canContribute,
  modelRefetch,
  updateClaim,
  components: customComponents,
  enableCanvasUserStatus,
  enableHighlightedRegions,
  canvasViewerPins,
  showBugReport,
  children,
}: CoreModelEditorProps) {
  const { t } = useTranslation();
  const runtime = useRef<Runtime>();
  const osd = useRef<any>();
  const gridRef = useRef<any>();
  const [showPanWarning, setShowPanWarning] = useLocalStorage('pan-warning', false);
  const [postSubmission, setPostSubmission] = useState(false);
  const [postSubmissionMessage, setPostSubmissionMessage] = useState(false);
  const [invalidateKey, invalidate] = useReducer(i => i + 1, 0);
  const [isOSD, setIsOSD] = useState(false);

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
    setIsOSD(true);
    if (osd.current) {
      osd.current.rotate();
    }
  };

  const features: RevisionProviderFeatures = isPreparing
    ? {
        autosave: false,
        autoSelectingRevision: true,
        revisionEditMode: false,
        directEdit: true,
      }
    : {
        preventMultiple: !allowMultiple,
        forkMode: forkMode,
      };

  const _components: Partial<EditorRenderingConfig> = isPreparing
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
  const components = { ..._components, ...(customComponents || {}) };

  const profileConfig: { [key: string]: Partial<EditorRenderingConfig> } = {
    [PARAGRAPHS_PROFILE]: slotConfig,
  };

  async function onAfterSave(ctx: { revisionRequest: RevisionRequest; context: RouteContext }) {
    if (!isEditing && !isPreparing) {
      await updateClaim(ctx);
    }

    if (modelRefetch) {
      await modelRefetch();
    }

    // If we have disabled preview, we need to show the post-submission.
    if (disablePreview && ctx.revisionRequest.revision.status !== 'draft') {
      if (disableNextCanvas) {
        setPostSubmissionMessage(true);
      } else {
        setPostSubmission(true);
      }
    }

    invalidate();
  }

  return (
    <DynamicVaultContext {...targetProps}>
      <RevisionProviderWithFeatures
        key={revision + invalidateKey}
        features={features}
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

        <CanvasViewer key={canvasViewerPins ? JSON.stringify(canvasViewerPins) : undefined} pins={canvasViewerPins}>
          {enableHighlightedRegions ? <CanvasHighlightedRegions /> : null}
          <CanvasViewerGrid $vertical={isVertical} ref={gridRef}>
            <CanvasViewerGridContent $vertical={isVertical}>
              {isOSD ? (
                <>
                  <InfoMessage
                    style={{ lineHeight: '3.4em', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
                  >
                    {t('You cannot edit annotations if you are rotating')}
                    <Button style={{ margin: '0.8em' }} onClick={() => setIsOSD(false)}>
                      Reset
                    </Button>
                  </InfoMessage>
                  <BrowserComponent fallback={null}>
                    <OpenSeadragonViewer ref={osd} />
                  </BrowserComponent>
                </>
              ) : (
                <EditorContentViewer
                  height={'100%' as any}
                  onCreated={rt => {
                    return ((runtime as any).current = rt.runtime);
                  }}
                  onPanInSketchMode={onPanInSketchMode}
                  {...targetProps}
                >
                  {(readOnlyAnnotations || []).map(anno => (
                    <ViewReadOnlyAnnotation key={anno.id} {...anno} />
                  ))}
                </EditorContentViewer>
              )}

              {hideViewerControls ? null : (
                <CanvasViewerControls>
                  {showBugReport ? <CreateModelTestCase captureModel={captureModel} /> : null}
                  {enableRotation ? (
                    <CanvasViewerButton onClick={rotate}>
                      <RotateIcon title={t('atlas__rotate', { defaultValue: 'Rotate' })} />
                    </CanvasViewerButton>
                  ) : null}
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
              {enableCanvasUserStatus ? <CanvasModelUserStatus isEditing={isEditing} /> : null}
              {preventFurtherSubmission ? (
                <>
                  <EmptyState style={{ fontSize: '1.25em' }} $box $noMargin>
                    <strong style={{ display: 'flex' }}>
                      <TickIcon style={{ marginRight: '0.5em', marginBottom: 0 }} /> {t('Task is complete!')}
                    </strong>
                  </EmptyState>
                  <EmptyState>
                    {markedAsUnusable ? (
                      t('You have marked this as unusable')
                    ) : (
                      <>
                        <p>{t('Thank you for your submission.')}</p>
                        <p>
                          {t('You can view your contribution in the left sidebar.')}{' '}
                          {t('You can continue working on another canvas.')}
                        </p>
                      </>
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

                  <ContributionSaveButton>
                    <EditorSlots.SubmitButton afterSave={onAfterSave} />
                  </ContributionSaveButton>
                </>
              ) : (
                <EmptyState>{t('Loading your model')}</EmptyState>
              )}
            </CanvasViewerGridSidebar>
          </CanvasViewerGrid>
          {children}
        </CanvasViewer>
      </RevisionProviderWithFeatures>
    </DynamicVaultContext>
  );
}
