import { useTranslation } from 'react-i18next';
import { AnnotationStyles } from '../../../../../types/annotation-styles';
import { ProjectFull } from '../../../../../types/project-full';
import { EditorContext } from '../../../../shared/capture-models/editor/components/EditorContext/EditorContext';
import { defaultTheme } from '../../../../shared/capture-models/editor/themes';
import { CaptureModel } from '../../../../shared/capture-models/types/capture-model';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { DashboardTab, DashboardTabs } from '../../../../shared/components/DashboardTabs';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { UniversalComponent } from '../../../../types';
import React, { useState } from 'react';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useMutation } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { AutoStructure } from '../model-editor/auto-structure';
import { PreviewCaptureModel } from '../model-editor/preview-capture-model';
import { ModelEditorProvider } from '../model-editor/use-model-editor-config';

type ProjectModelEditorType = {
  params: { id: string; captureModelId: string };
  query: unknown;
  variables: { id: number };
  data: {
    captureModel: CaptureModel;
    template?: string;
    annotationTheme?: ProjectFull['annotationTheme'];
    style_id?: ProjectFull['style_id'];
  };
};

export const ProjectModelEditor: UniversalComponent<ProjectModelEditorType> = createUniversalComponent<
  ProjectModelEditorType
>(
  ({ route }) => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, status, refetch } = useData(ProjectModelEditor, {}, { refetchInterval: false });
    const [newStructure, setNewStructure] = useState<CaptureModel['structure'] | undefined>();
    const [newDocument, setNewDocument] = useState<CaptureModel['document'] | undefined>();
    const { location } = useHistory();
    const [revisionNumber, setRevisionNumber] = useState(0);
    const api = useApi();
    const model = data?.captureModel;
    const config = useProjectTemplate(data?.template);
    const editorConfig = config?.configuration?.captureModels;
    const annotationTheme = data?.annotationTheme;
    const styleId = data?.style_id;

    const [updateModel, updateModelStatus] = useMutation(async (m: CaptureModel) => {
      if (m.id) {
        const newModel = await api.updateCaptureModel(m.id, m);

        setNewStructure(newModel.structure);
        setNewDocument(newModel.document);
        setRevisionNumber(n => n + 1);
      }
    }, {});

    if (!data || status !== 'success' || !model) {
      return <div>{t('loading')}</div>;
    }

    if (editorConfig?.noCaptureModel) {
      return <EmptyState>{t('No capture model for this project type')}</EmptyState>;
    }

    if (editorConfig?.preventChangeDocument && editorConfig?.preventChangeStructure) {
      return (
        <EditorContext captureModel={model}>
          <ModelEditorProvider template={data.template}>
            <PreviewCaptureModel
              structure={newStructure ? newStructure : model.structure}
              document={newDocument ? newDocument : model.document}
              revisionNumber={revisionNumber}
            />
          </ModelEditorProvider>
        </EditorContext>
      );
    }

    return (
      <>
        <ThemeProvider theme={defaultTheme}>
          <DashboardTabs>
            <DashboardTab $active={location.pathname === `/projects/${id}/model`}>
              <Link to={`/projects/${id}/model`}>{t('Home')}</Link>
            </DashboardTab>

            {!editorConfig?.preventChangeDocument ? (
              <DashboardTab $active={location.pathname === `/projects/${id}/model/document`}>
                <Link to={`/projects/${id}/model/document`}>{t('Document')}</Link>
              </DashboardTab>
            ) : null}

            {!editorConfig?.preventChangeStructure ? (
              <DashboardTab $active={location.pathname === `/projects/${id}/model/structure`}>
                <Link to={`/projects/${id}/model/structure`}>{t('Structure')}</Link>
              </DashboardTab>
            ) : null}

            <DashboardTab $active={location.pathname === `/projects/${id}/model/style`}>
              <Link to={`/projects/${id}/model/style`}>{t('Style')}</Link>
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
                  ...model,
                  structure,
                  document: newDocument ? newDocument : model.document,
                });
              }
            }}
            onDocumentChange={doc => {
              if (doc !== newDocument) {
                setNewDocument(doc);
                updateModel({
                  ...model,
                  structure: newStructure ? newStructure : model.structure,
                  document: doc,
                });
              }
            }}
            captureModel={model}
          >
            <ModelEditorProvider template={data.template}>
              <AutoStructure />
              {renderUniversalRoutes(route.routes, {
                structure: newStructure ? newStructure : model.structure,
                document: newDocument ? newDocument : model.document,
                revisionNumber,
                annotationTheme,
                styleId,
                refetch,
              })}
            </ModelEditorProvider>
          </EditorContext>
        </ThemeProvider>
      </>
    );
  },
  {
    getData: async (key, { id }, api) => {
      const { capture_model_id, template, annotationTheme, style_id } = await api.getProject(id);

      return {
        template,
        captureModel: await api.getCaptureModel(capture_model_id),
        annotationTheme,
        style_id,
      };
    },
    getKey: params => {
      return ['project-model', { id: Number(params.id) }];
    },
  }
);
