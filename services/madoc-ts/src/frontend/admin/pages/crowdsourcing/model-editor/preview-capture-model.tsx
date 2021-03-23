import React, { Suspense } from 'react';
import { Revisions, useCaptureModel } from '@capture-models/editor';
import { useApi } from '../../../../shared/hooks/use-api';
import { ContentExplorer } from '../../../../shared/components/ContentExplorer';
import { TinyButton } from '../../../../shared/atoms/Button';
import { RevisionNavigation } from '../../../../shared/caputre-models/RevisionNavigation';
import '../../../../shared/caputre-models/refinements';
import { CaptureModel } from '@capture-models/types';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';

export const PreviewCaptureModel: React.FC<{
  structure: CaptureModel['structure'];
  document: CaptureModel['document'];
  revisionNumber: number;
}> = ({ document, structure, revisionNumber }) => {
  const captureModel = useCaptureModel();
  const api = useApi();

  return (
    <>
      <h3>Preview</h3>
      <Revisions.Provider key={revisionNumber} captureModel={{ ...captureModel, structure, document }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '67%' }}>
            <ContentExplorer
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
          <div style={{ width: '33%', padding: '1em' }}>
            {api.getIsServer() ? null : (
              <RevisionNavigation
                structure={captureModel.structure}
                onSaveRevision={async (rev, status) => {
                  // no-op
                }}
              />
            )}
          </div>
        </div>
      </Revisions.Provider>
    </>
  );
};
