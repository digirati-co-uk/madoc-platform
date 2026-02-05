import '../../../src/frontend/shared/capture-models/editor/bundle';
import { ReactRenderer, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { PlayFunctionContext } from '@storybook/types';
// @ts-ignore
import React, { useMemo, useState } from 'react';
// @ts-ignore
import deepmerge from 'deepmerge';
import { VaultProvider } from 'react-iiif-vault';
import { ThemeProvider } from 'styled-components';
import { filterModelGetOptions } from '../../../src/capture-model-server/server-filters/filter-model-get-options';
import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';
import { WarningMessage } from '../../../src/frontend/shared/callouts/WarningMessage';
import { getDefaultAnnotationStyles } from '../../../src/frontend/shared/capture-models/AnnotationStyleContext';
import { defaultTheme } from '../../../src/frontend/shared/capture-models/editor/themes';
import { captureModelToRevisionList } from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { createChoice } from '../../../src/frontend/shared/capture-models/helpers/create-choice';
import { generateId } from '../../../src/frontend/shared/capture-models/helpers/generate-id';
import { ViewDocument } from '../../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { RevisionProviderWithFeatures } from '../../../src/frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
import { CoreModelEditor, CoreModelEditorProps } from '../../../src/frontend/shared/capture-models/new/CoreModelEditor';
import { DynamicVaultContext } from '../../../src/frontend/shared/capture-models/new/DynamicVaultContext';
import { EditorContentVariations } from '../../../src/frontend/shared/capture-models/new/EditorContent';
import { PluginProvider } from '../../../src/frontend/shared/capture-models/plugin-api/context';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { RevisionRequest } from '../../../src/frontend/shared/capture-models/types/revision-request';
import { RevisionList } from '../../../src/frontend/shared/capture-models/RevisionList';
import { TaskTabBackground, TaskTabItem, TaskTabRow } from '../../../src/frontend/shared/components/TaskTabs';
import { ViewerSavingContext } from '../../../src/frontend/shared/hooks/use-viewer-saving';
import { AnnotationStyles } from '../../../src/types/annotation-styles';
import { ErrorMessage } from '../../../src/frontend/shared/callouts/ErrorMessage';
import { generateModelFields } from '../../../src/utility/generate-model-fields';

export interface CaptureModelTestHarnessProps {
  captureModel: CaptureModel | { document: CaptureModel['document'] };
  revision?: string;
  annotationStyles?: Partial<AnnotationStyles['theme']>;
  target?: EditorContentVariations;
  coreProps?: Partial<CoreModelEditorProps>;

  initialTab?: number;

  errorMessage?: string;
  warningMessage?: string;
}

export type ModelStory = StoryObj<typeof CaptureModelTestHarness>;

function modelWithStructure(input: any): CaptureModel {
  const newModel = deepmerge({}, input);
  if (!newModel.id) {
    newModel.id = generateId();
  }
  if (!newModel.structure) {
    const modelFields = generateModelFields(newModel.document);
    newModel.structure = createChoice({
      label: 'Default',
      items: [
        {
          id: generateId(),
          type: 'model',
          label: 'Default',
          fields: modelFields,
        },
      ],
    });
  }
  return newModel;
}

export function CaptureModelTestHarness(props: CaptureModelTestHarnessProps) {
  const [captureModel, setCaptureModel] = useState<CaptureModel>(() => modelWithStructure(props.captureModel));
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

  const allRevisionsWithStructures = useMemo(() => {
    return captureModelToRevisionList(deepmerge({}, captureModel), true);
  }, [captureModel]);
  const allRevisions = useMemo(() => {
    return captureModelToRevisionList(deepmerge({}, captureModel), false);
  }, [captureModel]);
  const computedRevision = useMemo(() => {
    return revision
      ? filterModelGetOptions(deepmerge({}, captureModel), { revisionId: revision, onlyRevisionFields: true })
      : null;
  }, [captureModel, revision]);

  const incompleteRevisions = (captureModel.revisions || [])
    .filter(rev => {
      return !rev.approved;
    })
    .map(rev => rev.id);

  const revisionJson = (
    <>
      <pre data-testid="revision-json">{JSON.stringify(allRevisionsWithStructures, null, 2)}</pre>
      {computedRevision ? (
        <pre data-testid="computed-revision-json">{JSON.stringify(computedRevision, null, 2)}</pre>
      ) : null}
    </>
  );

  const modelJson = <pre data-testid="model-json">{JSON.stringify(captureModel, null, 2)}</pre>;

  return (
    <div>
      {props.errorMessage ? <ErrorMessage>{props.errorMessage}</ErrorMessage> : null}
      {props.warningMessage ? <WarningMessage>{props.warningMessage}</WarningMessage> : null}
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
                    filterRevisions={incompleteRevisions}
                  />
                </DynamicVaultContext>
              ) : null}
              {k === 3 ? (
                <DynamicVaultContext {...target}>
                  <RevisionProviderWithFeatures key={revision} captureModel={captureModel} revision={revision}>
                    {revision ? <button onClick={() => setRevision('')}>Clear revision</button> : null}
                    <RevisionList
                      title="Revisions"
                      revisions={allRevisions}
                      onClick={rev => {
                        setK(0);
                        setRevision(rev);
                      }}
                    />
                  </RevisionProviderWithFeatures>
                </DynamicVaultContext>
              ) : null}
              {k === 4 ? (
                <>
                  <h3>Revisions with structures</h3>
                  <pre>{JSON.stringify(allRevisionsWithStructures, null, 2)}</pre>
                  {revision ? (
                    <>
                      <h3>Computed revision</h3>
                      <pre>{JSON.stringify(computedRevision, null, 2)}</pre>
                    </>
                  ) : null}
                </>
              ) : null}
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

CaptureModelTestHarness.getModel = async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<CaptureModel> => {
  const canvas = within(canvasElement);
  const modelPre = await canvas.findByTestId('model-json');
  return JSON.parse(modelPre.innerText);
};

CaptureModelTestHarness.getComputedRevision = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}): Promise<CaptureModel> => {
  const canvas = within(canvasElement);
  const modelPre = await canvas.findByTestId('computed-revision-json');
  return JSON.parse(modelPre.innerText);
};

CaptureModelTestHarness.waitForViewer = (async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByTestId('ready', {}, { timeout: 10000 });
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
