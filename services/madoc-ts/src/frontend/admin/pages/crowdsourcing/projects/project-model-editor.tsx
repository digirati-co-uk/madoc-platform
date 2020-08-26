import { UniversalComponent } from '../../../../types';
import { EditorContext } from '@capture-models/editor';
import React, { useState } from 'react';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { Link, useParams } from 'react-router-dom';
import { defaultTheme } from '@capture-models/editor';
import { ThemeProvider } from 'styled-components';
import { CaptureModel } from '@capture-models/types';
import { useMutation } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { LightNavigation, LightNavigationItem } from '../../../../shared/atoms/LightNavigation';

type ProjectModelEditorType = {
  params: { id: string; captureModelId: string };
  query: {};
  variables: { id: number };
  data: CaptureModel;
};

export const ProjectModelEditor: UniversalComponent<ProjectModelEditorType> = createUniversalComponent<
  ProjectModelEditorType
>(
  ({ route }) => {
    const { id } = useParams<{ id: string }>();
    const { data, status } = useData(ProjectModelEditor, {}, { refetchInterval: false });
    const [newStructure, setNewStructure] = useState<CaptureModel['structure'] | undefined>();
    const [newDocument, setNewDocument] = useState<CaptureModel['document'] | undefined>();
    const [revisionNumber, setRevisionNumber] = useState(0);
    const api = useApi();

    const [updateModel, updateModelStatus] = useMutation(async (model: CaptureModel) => {
      if (model.id) {
        const newModel = await api.updateCaptureModel(model.id, model);

        setNewStructure(newModel.structure);
        setNewDocument(newModel.document);
        setRevisionNumber(n => n + 1);
      }
    }, {});

    if (!data || status !== 'success') {
      return <div>Loading...</div>;
    }

    return (
      <>
        <ThemeProvider theme={defaultTheme}>
          <LightNavigation>
            <LightNavigationItem>
              <Link to={`/projects/${id}/model`}>Home</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/projects/${id}/model/document`}>Document</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/projects/${id}/model/structure`}>Structure</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/projects/${id}/model/preview`}>Preview</Link>
            </LightNavigationItem>

            <div style={{ marginLeft: 'auto' }}>
              {updateModelStatus.status === 'loading' ? 'Saving...' : 'Changed saved.'}
            </div>
          </LightNavigation>
          <EditorContext
            onStructureChange={structure => {
              if (structure !== newStructure) {
                setNewStructure(structure);
                updateModel({
                  ...data,
                  structure,
                  document: newDocument ? newDocument : data.document,
                });
              }
            }}
            onDocumentChange={doc => {
              if (doc !== newDocument) {
                setNewDocument(doc);
                updateModel({
                  ...data,
                  structure: newStructure ? newStructure : data.structure,
                  document: doc,
                });
              }
            }}
            captureModel={data}
          >
            {renderUniversalRoutes(route.routes, {
              structure: newStructure ? newStructure : data.structure,
              document: newDocument ? newDocument : data.document,
              revisionNumber,
            })}
          </EditorContext>
        </ThemeProvider>
      </>
    );
  },
  {
    getData: async (key, { id }, api) => {
      const { capture_model_id } = await api.getProject(id);

      return api.getCaptureModel(capture_model_id);
    },
    getKey: params => {
      return ['project-model', { id: Number(params.id) }];
    },
  }
);
