import '../../../src/frontend/shared/capture-models/editor/bundle';
import { ReactRenderer, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import { PlayFunctionContext } from '@storybook/types';
import * as deepmerge from 'deepmerge';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { VaultProvider } from 'react-iiif-vault';
import { ThemeProvider } from 'styled-components';
import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';
import { getDefaultAnnotationStyles } from '../../../src/frontend/shared/capture-models/AnnotationStyleContext';
import { defaultTheme } from '../../../src/frontend/shared/capture-models/editor/themes';
import { captureModelToRevisionList } from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { ViewDocument } from '../../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { RevisionProviderWithFeatures } from '../../../src/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { CoreModelEditor, CoreModelEditorProps } from '../../../src/frontend/shared/capture-models/new/CoreModelEditor';
import { DynamicVaultContext } from '../../../src/frontend/shared/capture-models/new/DynamicVaultContext';
import { EditorContentVariations } from '../../../src/frontend/shared/capture-models/new/EditorContent';
import { PluginProvider } from '../../../src/frontend/shared/capture-models/plugin-api/context';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { RevisionRequest } from '../../../src/frontend/shared/capture-models/types/revision-request';
import { RevisionList } from '../../../src/frontend/shared/components/RevisionList';
import { TaskTabBackground, TaskTabItem, TaskTabRow } from '../../../src/frontend/shared/components/TaskTabs';
import { ViewerSavingContext } from '../../../src/frontend/shared/hooks/use-viewer-saving';
import { AnnotationStyles } from '../../../src/types/annotation-styles';

export interface CaptureModelTestHarnessProps {
  captureModel: CaptureModel;
  revision?: string;
  annotationStyles?: Partial<AnnotationStyles['theme']>;
  target?: EditorContentVariations;
  coreProps?: Partial<CoreModelEditorProps>;

  initialTab?: number;
}

export type ModelStory = StoryObj<typeof CaptureModelTestHarness>;

export function CaptureModelTestHarness(props: CaptureModelTestHarnessProps) {
  const [captureModel, setCaptureModel] = useState<CaptureModel>(() => deepmerge({}, props.captureModel));
  const [k, setK] = useState(props.initialTab || 0);
  const [revision, setRevision] = useState(props.revision);
  const styles = useMemo(() => deepmerge(props.annotationStyles, getDefaultAnnotationStyles()), [
    props.annotationStyles,
  ]);

  const createRevision = (req, status) => {
    const newModel = deepmerge({}, captureModel);
    updateRevisionInDocument(newModel, req, {
      allowAnonymous: true,
    });

    newModel.revisions = captureModel.revisions || [];
    newModel.revisions.push(req.revision);
    req.revision.status = status;

    setCaptureModel(newModel);
    return req;
  };

  const updateRevision = (req, status) => {
    const newModel = deepmerge({}, captureModel);
    updateRevisionInDocument(newModel, req, {
      allowAnonymous: true,
    });

    req.revision.status = status;
    newModel.revisions = captureModel.revisions || [];
    newModel.revisions = newModel.revisions.map(rev => {
      if (rev.id === req.revision.id) {
        return req.revision;
      }
      return rev;
    });

    setCaptureModel(newModel);
    return req;
  };

  const target = props.target || {
    manifestUri: 'https://digirati-co-uk.github.io/wunder.json',
    canvasUri: 'https://digirati-co-uk.github.io/wunder/canvases/0',
  };

  const revisionJson = (
    <pre data-testid="revision-json">{JSON.stringify(captureModelToRevisionList(captureModel, true), null, 2)}</pre>
  );
  const modelJson = <pre data-testid="model-json">{JSON.stringify(captureModel, null, 2)}</pre>;

  return (
    <div>
      <TaskTabBackground>
        <TaskTabRow>
          <TaskTabItem $active={k === 0} onClick={() => setK(0)}>
            Capture model editor
          </TaskTabItem>
          <TaskTabItem $active={k === 1} onClick={() => setK(1)}>
            JSON
          </TaskTabItem>
          <TaskTabItem $active={k === 2} onClick={() => setK(2)}>
            Document view
          </TaskTabItem>
          <TaskTabItem $active={k === 3} onClick={() => setK(3)}>
            Revision list
          </TaskTabItem>
          <TaskTabItem $active={k === 4} onClick={() => setK(4)}>
            Revision list (json)
          </TaskTabItem>
          {/*<TaskTabItem $active={k === 5} onClick={() => setK(5)}>*/}
          {/*  Read-only capture model*/}
          {/*</TaskTabItem>*/}
          {/*<TaskTabItem $active={k === 6} onClick={() => setK(6)}>*/}
          {/*  Debug screen*/}
          {/*</TaskTabItem>*/}
        </TaskTabRow>
      </TaskTabBackground>

      <VaultProvider>
        <ThemeProvider theme={defaultTheme}>
          <PluginProvider>
            <ViewerSavingContext.Provider value={{ updateRevision, createRevision }}>
              {k === 0 ? (
                <DynamicVaultContext {...target}>
                  <CoreModelEditor
                    target={target}
                    updateClaim={ctx => console.log(ctx)}
                    canContribute
                    disableNextCanvas
                    enableRotation
                    annotationTheme={styles}
                    disablePreview
                    revision={revision}
                    captureModel={captureModel as any}
                    canvasViewerPins={{
                      // All of these are API tied.
                      disableAnnotationPanel: true,
                      disableMetadata: true,
                      disablePersonalNotes: true,
                      disableTranscriptionMenu: true,
                      disableDocumentPanel: true,
                      disableRevisionPanel: true,
                    }}
                    {...(props.coreProps || {})}
                    components={{
                      PostSubmission: function StubbedPostSubmission() {
                        return <div data-testid="thanks-page">Thanks</div>;
                      },
                      ...(props.coreProps?.components || {}),
                    }}
                  >
                    <div data-testid="ready"></div>
                  </CoreModelEditor>
                </DynamicVaultContext>
              ) : null}
              {k === 1 ? <pre>{JSON.stringify(captureModel, null, 2)}</pre> : null}
              {k === 2 ? (
                <DynamicVaultContext {...target}>
                  <ViewDocument
                    key={JSON.stringify(captureModel.document)}
                    hideEmpty
                    document={captureModel.document}
                    highlightRevisionChanges={revision}
                  />
                </DynamicVaultContext>
              ) : null}
              {k === 3 ? (
                <DynamicVaultContext {...target}>
                  <RevisionProviderWithFeatures key={revision} captureModel={captureModel} revision={revision}>
                    {revision ? <button onClick={() => setRevision('')}>Clear revision</button> : null}
                    <RevisionList
                      title="Revisions"
                      revisions={captureModelToRevisionList(captureModel, false)}
                      onClick={rev => {
                        setK(0);
                        setRevision(rev);
                      }}
                    />
                  </RevisionProviderWithFeatures>
                </DynamicVaultContext>
              ) : null}
              {k === 4 ? <pre>{JSON.stringify(captureModelToRevisionList(captureModel, true), null, 2)}</pre> : null}
            </ViewerSavingContext.Provider>
          </PluginProvider>
        </ThemeProvider>
      </VaultProvider>
      <div style={{ display: 'none' }}>
        {modelJson}
        {revisionJson}
      </div>
    </div>
  );
}

CaptureModelTestHarness.publishSubmission = (async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await wait(200);

  const Submit = await canvas.findByText('Submit');
  await userEvent.click(Submit);

  await canvas.findByTestId('thanks-page');
}) as ModelStory['play'];

CaptureModelTestHarness.getRevisions = async ({
  canvasElement,
}: PlayFunctionContext<ReactRenderer>): Promise<RevisionRequest[]> => {
  const canvas = within(canvasElement);
  const revPre = await canvas.findByTestId('revision-json');
  return JSON.parse(revPre.innerText);
};

CaptureModelTestHarness.getModel = (async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const modelPre = await canvas.findByTestId('model-json');
  return JSON.parse(modelPre.innerText);
}) as ModelStory['play'];

CaptureModelTestHarness.waitForViewer = (async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByTestId('ready');
  await canvas.findByTestId('ready');

  await wait(1000);
}) as ModelStory['play'];

CaptureModelTestHarness.story = (args?: ModelStory['args']): ModelStory => {
  const ret = CaptureModelTestHarness.bind({});
  if (args) {
    ret.args = args;
  }
  return ret;
};

export function wait(t = 500) {
  return new Promise(resolve => setTimeout(resolve, t));
}
