import React, { useState } from 'react';
import { useLoadedCaptureModel } from '../hooks/use-loaded-capture-model';
import { Revisions } from '@capture-models/editor';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../atoms/EditorToolbar';
import { HrefLink } from '../utility/href-link';
import { ArrowBackIcon } from '../icons/ArrowBackIcon';
import { CaptureModelHeader } from '../caputre-models/CaptureModelHeader';
import { PreviewIcon } from '../icons/PreviewIcon';
import { FullScreenExitIcon } from '../icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../icons/FullScreenEnterIcon';
import { ViewContent } from '../components/ViewContent';
import { CaptureModelEditor } from '../caputre-models/CaptureModelEditor';
import { MaximiseWindow } from '../atoms/MaximiseWindow';
import { RevisionRequest } from '@capture-models/types';
import '../caputre-models/refinements';

export const CaptureModelViewer: React.FC<{
  modelId: string;
  backLink?: string;
  revisionId?: string;
  onSave: (response: RevisionRequest, status: string | undefined) => Promise<void>;
}> = ({ backLink, revisionId, modelId, onSave }) => {
  const [isVertical, setIsVertical] = useState(false);
  const [{ captureModel, canvas, target }, status, refetch] = useLoadedCaptureModel(modelId);

  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <MaximiseWindow>
        {({ toggle, isOpen }) =>
          captureModel ? (
            <Revisions.Provider captureModel={captureModel} revision={revisionId}>
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
                  <EditorToolbarLabel>Switch layout</EditorToolbarLabel>
                </EditorToolbarButton>
                <EditorToolbarButton onClick={toggle}>
                  <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                </EditorToolbarButton>
              </EditorToolbarContainer>
              <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
                <div style={{ width: isVertical ? '100%' : '67%' }}>
                  {canvas ? (
                    <ViewContent
                      key={`${isVertical ? 'y' : 'n'}${isOpen ? 'y' : 'n'}`}
                      target={captureModel.target as any}
                      canvas={canvas}
                    />
                  ) : null}
                </div>
                <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
                  <CaptureModelEditor captureModel={captureModel} onSave={onSave} />
                </div>
              </div>
            </Revisions.Provider>
          ) : (
            'loading...'
          )
        }
      </MaximiseWindow>
    </React.Suspense>
  );
};
