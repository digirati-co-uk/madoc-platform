import { VaultProvider } from 'react-iiif-vault';
import React, { Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCaptureModel } from '../../../../shared/capture-models/editor/components/EditorContext/EditorContext';
import { BackToChoicesButton } from '../../../../shared/capture-models/new/components/BackToChoicesButton';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { useApi } from '../../../../shared/hooks/use-api';
import { ContentExplorer } from '../../../../shared/components/ContentExplorer';
import { useData } from '../../../../shared/hooks/use-data';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import '../../../../shared/capture-models/refinements';
import { BrowserComponent } from '../../../../shared/utility/browser-component';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';
import { ProjectModelEditor } from '../projects/project-model-editor';

export const PreviewCaptureModel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useData(ProjectModelEditor);
  const api = useApi();
  const [preview, setPreview] = useState(false);

  if (!data) {
    return null;
  }

  const { captureModel, annotationTheme } = data;

  return (
    <VaultProvider>
      <h3>Preview</h3>
      <RevisionProviderWithFeatures
        slotConfig={{
          editor: {
            allowEditing: true,
          },
        }}
        features={{
          autosave: false,
          revisionEditMode: true,
          basicUnNesting: true,
        }}
        captureModel={{ ...captureModel }}
        annotationTheme={annotationTheme as any}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '67%' }}>
            <ContentExplorer
              projectId={id}
              renderChoice={(canvasId, reset) => (
                <BrowserComponent fallback={<>Loading</>}>
                  <div>
                    <ViewContentFetch id={canvasId} />
                    <br />
                    <TinyButton onClick={reset}>Select different image</TinyButton>
                  </div>
                </BrowserComponent>
              )}
            />
          </div>
          <div style={{ width: '33%', padding: '0 1em' }}>
            {api.getIsServer() ? null : (
              <>
                <div style={{ padding: '1em 1em 0 1em', fontSize: '13px' }}>
                  <BackToChoicesButton />
                  {preview ? <EditorSlots.PreviewSubmission /> : <EditorSlots.TopLevelEditor />}
                  <ButtonRow>
                    <Button onClick={() => setPreview(p => !p)}>{preview ? 'Edit mode' : 'Preview mode'}</Button>
                  </ButtonRow>
                </div>
              </>
            )}
          </div>
        </div>
      </RevisionProviderWithFeatures>
    </VaultProvider>
  );
};
