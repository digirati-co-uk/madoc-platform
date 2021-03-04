import { useTranslation } from 'react-i18next';
import { DashboardTab, DashboardTabs } from '../../../../shared/components/DashboardTabs';
import { UniversalComponent } from '../../../../types';
import { EditorContext } from '@capture-models/editor';
import React, { useState } from 'react';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { Link, useHistory, useParams } from 'react-router-dom';
import { defaultTheme } from '@capture-models/editor';
import { ThemeProvider } from 'styled-components';
import { CaptureModel } from '@capture-models/types';
import { useMutation } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { AutoStructure } from '../model-editor/auto-structure';

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
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, status } = useData(ProjectModelEditor, {}, { refetchInterval: false });
    const [newStructure, setNewStructure] = useState<CaptureModel['structure'] | undefined>();
    const [newDocument, setNewDocument] = useState<CaptureModel['document'] | undefined>();
    const { location } = useHistory();
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
      return <div>{t('loading')}</div>;
    }

    return (
      <>
        <ThemeProvider theme={defaultTheme}>
          <DashboardTabs>
            <DashboardTab $active={location.pathname === `/projects/${id}/model`}>
              <Link to={`/projects/${id}/model`}>{t('Home')}</Link>
            </DashboardTab>

            <DashboardTab $active={location.pathname === `/projects/${id}/model/document`}>
              <Link to={`/projects/${id}/model/document`}>{t('Document')}</Link>
            </DashboardTab>

            <DashboardTab $active={location.pathname === `/projects/${id}/model/structure`}>
              <Link to={`/projects/${id}/model/structure`}>{t('Structure')}</Link>
            </DashboardTab>

            <DashboardTab $active={location.pathname === `/projects/${id}/model/preview`}>
              <Link to={`/projects/${id}/model/preview`}>{t('Preview')}</Link>
            </DashboardTab>

            <div style={{ marginLeft: 'auto' }}>
              {updateModelStatus.status === 'loading' ? t('Saving') : t('Changes saved')}
            </div>
          </DashboardTabs>
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
            <>
              <AutoStructure />
              {renderUniversalRoutes(route.routes, {
                structure: newStructure ? newStructure : data.structure,
                document: newDocument ? newDocument : data.document,
                revisionNumber,
              })}
            </>
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
