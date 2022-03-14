import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { EditorContentViewer } from '../capture-models/new/EditorContent';
import { AutoSelectingRevision } from '../capture-models/new/features/AutoSelectingRevision';
import { CaptureModel } from '../capture-models/types/capture-model';
import { RevisionRequest } from '../capture-models/types/revision-request';
import { useLoadedCaptureModel } from '../hooks/use-loaded-capture-model';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../navigation/EditorToolbar';
import { HrefLink } from '../utility/href-link';
import { ArrowBackIcon } from '../icons/ArrowBackIcon';
import { CaptureModelHeader } from '../capture-models/CaptureModelHeader';
import { PreviewIcon } from '../icons/PreviewIcon';
import { FullScreenExitIcon } from '../icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../icons/FullScreenEnterIcon';
import { CaptureModelEditor } from '../capture-models/CaptureModelEditor';
import { MaximiseWindow } from '../layout/MaximiseWindow';
import '../capture-models/refinements';
import { RevisionEditor } from './revision-editor';
import { Revisions } from '../capture-models/editor/stores/revisions/index';

export const CaptureModelViewer: React.FC<{
  modelId: string;
  initialModel?: CaptureModel;
  backLink?: string;
  revisionId?: string;
  readOnly?: boolean;
  overrideCanvasId?: number;
  allowEdits?: boolean;
  onSave: (response: RevisionRequest, status: string | undefined) => Promise<void>;
}> = ({ backLink, revisionId, modelId, allowEdits = true, overrideCanvasId, initialModel, onSave, readOnly }) => {
  const { t } = useTranslation();
  const config = useSiteConfiguration();
  const [isVertical, setIsVertical] = useState(config.project.defaultEditorOrientation === 'vertical');
  const [{ captureModel, canvas, target }] = useLoadedCaptureModel(modelId, initialModel, overrideCanvasId);

  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <Revisions.Provider captureModel={captureModel} revision={revisionId}>
              {/* Features of the provider. */}
              <AutoSelectingRevision />

              <EditorToolbarContainer>
                {backLink ? (
                  <EditorToolbarButton as={HrefLink} href={backLink}>
                    <EditorToolbarIcon>
                      <ArrowBackIcon />
                    </EditorToolbarIcon>
                  </EditorToolbarButton>
                ) : null}
                <EditorToolbarTitle>
                  <CaptureModelHeader />
                </EditorToolbarTitle>
                <EditorToolbarSpacer />

                <EditorToolbarButton onClick={() => setIsVertical(r => !r)}>
                  <EditorToolbarIcon>
                    <PreviewIcon />
                  </EditorToolbarIcon>
                  <EditorToolbarLabel>
                    {t('atlas__switch-layout', { defaultValue: 'Switch layout' })}
                  </EditorToolbarLabel>
                </EditorToolbarButton>
                <EditorToolbarButton onClick={toggle}>
                  <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                </EditorToolbarButton>
              </EditorToolbarContainer>
              <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
                <div style={{ width: isVertical ? '100%' : '67%' }}>
                  {canvas ? (
                    <EditorContentViewer
                      key={`${captureModel.id}${isVertical ? 'y' : 'n'}${isOpen ? 'y' : 'n'}`}
                      canvasId={overrideCanvasId}
                      canvas={canvas}
                      target={captureModel.target}
                    />
                  ) : null}
                </div>
                <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
                  {revisionId ? (
                    <RevisionEditor allowEdits={allowEdits} readOnly={!!readOnly} onSave={onSave} />
                  ) : (
                    <CaptureModelEditor captureModel={captureModel} onSave={onSave} />
                  )}
                </div>
              </div>
            </Revisions.Provider>
          ) : (
            t('loading')
          )
        }
      </MaximiseWindow>
    </React.Suspense>
  );
};
