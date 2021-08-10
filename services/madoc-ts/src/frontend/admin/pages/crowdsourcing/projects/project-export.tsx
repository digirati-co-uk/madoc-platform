import React from 'react';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useTranslation } from 'react-i18next';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { ProjectExportFull } from '../../../../../types/project-export-full';

type ProjectExportType = {
  params: { id: string };
  query: unknown;
  data: ProjectExportFull;
  variables: { id: number };
};

export const ProjectExportTab: UniversalComponent<ProjectExportType> = createUniversalComponent<ProjectExportType>(
  ({ route }) => {
    const { t } = useTranslation();
    const { resolvedData: data, status } = usePaginatedData(ProjectExportTab);

    return (
      <>
        <h2>Export Project</h2>
        <hr />
        {data && (<pre>{JSON.stringify(data, null, 2)}</pre>)}
      </>
    )
  },
  {
    getData: async (key, { id }, api) => {
      const projectExport = await api.exportProject(id);
      const captureModel = await api.getCaptureModel(projectExport.capture_model_id);
      return {
        templateName: projectExport.templateName,
        config: projectExport.config,
        captureModel: captureModel,
      };
    },
    getKey: params => {
      return ['project-export', { id: Number(params.id) }];
    },
  }
);