import { VaultProvider } from 'react-iiif-vault';
import React, { Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnnotationStyles } from '../../../../../types/annotation-styles';
import { useCaptureModel } from '../../../../shared/capture-models/editor/components/EditorContext/EditorContext';
import { BackToChoicesButton } from '../../../../shared/capture-models/new/components/BackToChoicesButton';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { CaptureModel } from '../../../../shared/capture-models/types/capture-model';
import { useApi } from '../../../../shared/hooks/use-api';
import { ContentExplorer } from '../../../../shared/components/ContentExplorer';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import '../../../../shared/capture-models/refinements';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';

export const PreviewCaptureModel: React.FC<{
  structure: CaptureModel['structure'];
  document: CaptureModel['document'];
  annotationTheme?: AnnotationStyles['theme'];
  revisionNumber: number;
}> = ({ document, structure, revisionNumber, annotationTheme }) => {
  const { id } = useParams<{ id: string }>();
  const captureModel = useCaptureModel();
  const api = useApi();
  const [preview, setPreview] = useState(false);

  return (
    <VaultProvider>
      <h3>Preview</h3>
      <RevisionProviderWithFeatures
        key={revisionNumber}
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
        captureModel={{ ...captureModel, structure, document }}
        annotationTheme={annotationTheme}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '67%' }}>
            <ContentExplorer
              projectId={id}
              renderChoice={(canvasId, reset) => (
                <Suspense fallback={<>Loading</>}>
                  <div>
                    <ViewContentFetch id={canvasId} />
                    <br />
                    <TinyButton onClick={reset}>Select different image</TinyButton>
                  </div>
                </Suspense>
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
