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
import { Button } from '../../../../shared/atoms/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

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
    const api = useApi();

    const [updateModel] = useMutation(async (model: CaptureModel) => {
      if (model.id) {
        await api.updateCaptureModel(model.id, model);
      }
      setNewStructure(undefined);
      setNewDocument(undefined);
    }, {});

    if (!data || status !== 'success') {
      return <div>Loading...</div>;
    }

    return (
      <>
        <ThemeProvider theme={defaultTheme}>
          <div>
            [ <Link to={`/projects/${id}/model`}>Home</Link> |{' '}
            <Link to={`/projects/${id}/model/document`}>Document</Link> |{' '}
            <Link to={`/projects/${id}/model/structure`}>Structure</Link> ]
          </div>
          {newStructure || newDocument ? (
            <Button
              onClick={() =>
                updateModel({
                  ...data,
                  structure: newStructure ? newStructure : data.structure,
                  document: newDocument ? newDocument : data.document,
                })
              }
            >
              Save changes
            </Button>
          ) : null}
          <EditorContext
            onStructureChange={structure => {
              if (structure !== newStructure) {
                setNewStructure(structure);
              }
            }}
            onDocumentChange={doc => {
              if (doc !== newDocument) {
                setNewDocument(doc);
              }
            }}
            captureModel={data}
          >
            {renderUniversalRoutes(route.routes)}
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
