import { Revisions } from '@capture-models/editor';
import { URLContextExplorer } from '../src/frontend/shared/components/ContentExplorer';
import * as React from 'react';
import { TinyButton } from '../src/frontend/shared/atoms/Button';
import { object, text } from '@storybook/addon-knobs';
import { CaptureModel } from '@capture-models/types';
import { RevisionNavigation } from '../src/frontend/shared/caputre-models/RevisionNavigation';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { ViewExternalContent } from '../src/frontend/shared/components/ViewExternalContent';

export default { title: 'Capture models' };

const exampleModel: CaptureModel = {
  id: '0e1cf2ad-6a8a-4a50-93dc-147c78c107a5',
  structure: {
    id: 'd2fc5e9f-b234-4e0f-8e6d-152c666d4a6d',
    type: 'choice',
    label: 'Testing this change ',
    items: [
      {
        id: '1f49d09c-c55e-407e-b25c-4c4cc58086b1',
        type: 'model',
        label: 'test 2 3 4',
        fields: ['test'],
      },
    ],
  },
  document: {
    id: '1a87e8f3-84d7-4c8e-b48f-c88dca685418',
    type: 'entity',
    label: 'Untitled document',
    properties: {
      test: [
        {
          id: '15a6ea62-3240-4d59-a821-737c3dd3cc1d',
          type: 'text-field',
          label: 'test',
          value: '',
          allowMultiple: true,
          selector: {
            id: 'db64a4ee-9bfd-4c86-b795-70e1f86b3c72',
            type: 'box-selector',
            state: {
              x: 592,
              y: 296,
              width: 751,
              height: 315,
            },
          },
          revision: 'b8e853c5-709d-4cf4-ae17-b6686e528d33',
        },
        {
          id: '8d1f1bf7-d5fb-4083-b164-61fed8883202',
          type: 'text-field',
          label: 'test',
          value: '',
          allowMultiple: true,
          selector: {
            id: '664142c9-cc04-41c9-8cb3-9299ede6e88b',
            type: 'box-selector',
            state: null,
          },
        },
      ],
    },
  },
  target: [
    {
      id: 'urn:madoc:canvas:8',
      type: 'Canvas',
    },
    {
      id: 'urn:madoc:manifest:2',
      type: 'Manifest',
    },
    {
      id: 'urn:madoc:collection:1',
      type: 'Collection',
    },
  ],
  contributors: {
    'urn:madoc:user:1': {
      id: 'urn:madoc:user:1',
      type: 'Person',
      name: 'Madoc TS',
    },
  },
};

export const CaptureModelSandbox: React.FC = () => {
  const captureModel = object('Capture model', exampleModel);
  const defaultManifest = text('Manifest', 'https://wellcomelibrary.org/iiif/b18035723/manifest');

  const type = React.useMemo(() => {
    return { type: 'Manifest', id: defaultManifest };
  }, [defaultManifest]);

  return (
    <VaultProvider>
      <h3>Preview</h3>
      <Revisions.Provider captureModel={captureModel}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '67%' }}>
            <URLContextExplorer
              defaultResource={type}
              renderChoice={(canvasId, manifestId, reset) => (
                <React.Suspense fallback={<>Loading</>}>
                  <div>
                    <ViewExternalContent
                      target={[
                        { type: 'Canvas', id: canvasId },
                        { type: 'Manifest', id: manifestId },
                      ]}
                    />
                    <TinyButton onClick={reset}>Select different image</TinyButton>
                  </div>
                </React.Suspense>
              )}
            />
          </div>
          <div style={{ width: '33%', padding: '1em' }}>
            <RevisionNavigation
              structure={captureModel.structure}
              onSaveRevision={async (rev, status) => {
                console.log(rev, status);
              }}
            />
          </div>
        </div>
      </Revisions.Provider>
    </VaultProvider>
  );
};
