import React from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button } from '../../../../shared/navigation/Button';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { JsonProjectTemplate } from '../../../../../extensions/projects/types';
import { BuildProjectExport } from '../../../features/build-project-export';

type ProjectExportType = {
  params: { id: string };
  query: unknown;
  data: JsonProjectTemplate;
  variables: { id: number };
};

export const ProjectExportTab: UniversalComponent<ProjectExportType> = createUniversalComponent<ProjectExportType>(
  () => {
    const { resolvedData: data } = usePaginatedData(ProjectExportTab);

    return (
      <>
        <h2>Export Project template</h2>
        {data ? (
          <FilePreview
            lazyLoad={() => ({ type: 'text', value: JSON.stringify(data, null, 2) })}
            fileName={`template.json`}
          />
        ) : null}
        <h2>Export data</h2>
        <BuildProjectExport />
      </>
    );
  },
  {
    getData: async (key, { id }, api) => {
      return await api.exportProject(id);
    },
    getKey: params => {
      return ['project-export', { id: Number(params.id) }];
    },
  }
);
