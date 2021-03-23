import { Revisions } from '@capture-models/editor';
import { CaptureModel } from '@capture-models/types';
import * as React from 'react';
import { Suspense, useMemo } from 'react';
import { useQuery } from 'react-query';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { preprocessCaptureModel } from '../../../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { RevisionNavigation } from '../../../../shared/caputre-models/RevisionNavigation';
import { documentFragmentWrapper } from '../../../../shared/caputre-models/utility/document-fragment-wrapper';
import { useApi } from '../../../../shared/hooks/use-api';
import { ViewContentFetch } from '../../../molecules/ViewContentFetch';

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
            {api.getIsServer() ? null : (
              <Suspense fallback={<>Loading</>}>
                <div>
                  <ViewContentFetch id={Number(canvasId)} />
                  <br />
                </div>
              </Suspense>
            )}
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
