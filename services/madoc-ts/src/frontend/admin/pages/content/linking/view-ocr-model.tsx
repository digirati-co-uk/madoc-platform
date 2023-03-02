import * as React from 'react';
import { Suspense, useMemo } from 'react';
import { useQuery } from 'react-query';
import { preprocessCaptureModel } from '../../../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
import { RevisionNavigation } from '../../../../shared/capture-models/RevisionNavigation';
import { CaptureModel } from '../../../../shared/capture-models/types/capture-model';
import { documentFragmentWrapper } from '../../../../shared/capture-models/utility/document-fragment-wrapper';
import { useApi } from '../../../../shared/hooks/use-api';
import { BrowserComponent } from '../../../../shared/utility/browser-component';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';
import { Revisions } from '../../../../shared/capture-models/editor/stores/revisions/index';

export const ViewOCRModel: React.FC<{ canvasId: number; link: ResourceLinkResponse }> = ({ canvasId, link }) => {
  const api = useApi();

  const { data: captureModelField } = useQuery(['get-storage-json-data', { id: link.link.id }], async () => {
    if (link.file) {
      if (link.file.path.endsWith('json')) {
        return api.getStorageJsonData(link.file.bucket, link.file.path);
      }
    }
  });

  const captureModel: CaptureModel | undefined = useMemo(
    () => (captureModelField ? documentFragmentWrapper(preprocessCaptureModel(captureModelField)) : undefined),
    [captureModelField]
  );

  if (!captureModelField || !captureModel) {
    return null;
  }

  return (
    <>
      <h3>Preview</h3>
      <Revisions.Provider captureModel={captureModel}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '50%' }}>
            <BrowserComponent fallback={<>Loading</>}>
              <div>
                <ViewContentFetch id={Number(canvasId)} />
                <br />
              </div>
            </BrowserComponent>
          </div>
          <div style={{ width: '50%', padding: '1em' }}>
            {api.getIsServer() ? null : (
              <RevisionNavigation
                readOnly={true}
                allowEdits={false}
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
