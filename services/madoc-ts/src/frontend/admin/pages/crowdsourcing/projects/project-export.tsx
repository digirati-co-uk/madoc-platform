import React from 'react';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { JsonProjectTemplate } from '../../../../../extensions/projects/types';

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
        <h2>Export Project</h2>
        <hr />
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
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
