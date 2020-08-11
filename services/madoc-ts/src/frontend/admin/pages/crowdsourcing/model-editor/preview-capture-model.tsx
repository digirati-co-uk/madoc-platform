import React, { Suspense } from 'react';
import { Revisions, useCaptureModel } from '@capture-models/editor';
import { CaptureModelEditor } from '../../../../shared/caputre-models/CaptureModelEditor';
import { useApi } from '../../../../shared/hooks/use-api';
import { ContentExplorer } from '../../../../shared/components/ContentExplorer';
import { ViewContent } from '../../../../shared/components/ViewContent';
import { useQuery } from 'react-query';
import { TinyButton } from '../../../../shared/atoms/Button';
import { RevisionNavigation } from '../../../../shared/caputre-models/RevisionNavigation';

const ViewContentFetch: React.FC<{ id: number }> = ({ id }) => {
  const api = useApi();
  const { data } = useQuery(['preview-canvas', id], () => {
    return api.getCanvasById(id);
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <ViewContent
      target={[
        { type: 'Canvas', id: 'http://canvas/' + data.canvas.id },
        { type: 'Manifest', id: 'http://manifest/top' },
      ]}
      canvas={data.canvas}
    />
  );
};

export const PreviewCaptureModel: React.FC = () => {
  const captureModel = useCaptureModel();
  const api = useApi();

  return (
    <>
      <h3>Preview</h3>
      <Revisions.Provider captureModel={captureModel}>
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
                  console.log(rev, status);
                }}
              />
            )}
          </div>
        </div>
      </Revisions.Provider>
    </>
  );
};
