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
import { Button } from '../../../../shared/navigation/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { LightNavigation, LightNavigationItem } from '../../../../shared/navigation/LightNavigation';

type ViewCaptureModelType = {
  params: { id: string; captureModelId: string };
  query: {};
  variables: { id: string };
  data: CaptureModel;
};

export const ViewCaptureModel: UniversalComponent<ViewCaptureModelType> = createUniversalComponent<
  ViewCaptureModelType
>(
  ({ route }) => {
    const { id } = useParams<{ id: string }>();
    const { data, status } = useData(ViewCaptureModel, {}, { refetchInterval: false });
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
          <LightNavigation>
            <LightNavigationItem>
              <Link to={`/capture-models/${id}`}>Home</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/capture-models/${id}/document`}>Document</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/capture-models/${id}/structure`}>Structure</Link>
            </LightNavigationItem>
            <LightNavigationItem>
              <Link to={`/capture-models/${id}/preview`}>Preview</Link>
            </LightNavigationItem>
          </LightNavigation>

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
      return api.getCaptureModel(id);
    },
    getKey: params => {
      return ['capture-model', { id: params.id }];
    },
  }
);
