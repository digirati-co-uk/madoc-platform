import { VaultProvider } from '@hyperion-framework/react-vault';
import React, { Suspense, useState } from 'react';
import { useCaptureModel } from '@capture-models/editor';
import { useParams } from 'react-router-dom';
import { BackToChoicesButton } from '../../../../shared/caputre-models/new/components/BackToChoicesButton';
import { EditorSlots } from '../../../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { useApi } from '../../../../shared/hooks/use-api';
import { ContentExplorer } from '../../../../shared/components/ContentExplorer';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import '../../../../shared/caputre-models/refinements';
import { CaptureModel } from '@capture-models/types';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';

export const PreviewCaptureModel: React.FC<{
  structure: CaptureModel['structure'];
  document: CaptureModel['document'];
  revisionNumber: number;
}> = ({ document, structure, revisionNumber }) => {
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
