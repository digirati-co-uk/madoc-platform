import React, { useMemo } from 'react';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { ProjectTask } from '../../../../types/tasks/project-task';
import { CollectionFull } from '../../../../types/schemas/collection-full';

type ProjectLoaderType = {
  params: { slug: string };
  query: {};
  variables: { slug: string };
  data: {
    task: ProjectTask;
    project: ProjectFull;
    collections: CollectionFull;
    manifests: CollectionFull;
  };
  context: { project: ProjectFull };
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  ({ route }) => {
    const { data } = useStaticData(ProjectLoader);

    const ctx = useMemo(() => (data ? { id: data.project.id, name: data.project.label } : undefined), [data]);

    if (!data) {
      return <div>Loading...</div>;
    }

    return <BreadcrumbContext project={ctx}>{renderUniversalRoutes(route.routes, data)}</BreadcrumbContext>;
  },
  {
    getKey: params => {
      return ['site-project', { slug: params.slug }];
    },
    getData: async (key, variables, api) => {
      const project = await api.getSiteProject(variables.slug);

      const [task, collections, manifests] = await Promise.all([
        await api.getTaskById<ProjectTask>(project.task_id),
        await api.getSiteCollection(project.collection_id, { type: 'collection' }),
        await api.getSiteCollection(project.collection_id, { type: 'manifest' }),
      ]);

      return {
        project: await api.getSiteProject(variables.slug),
        collections,
        manifests,
        task,
      };
    },
  }
);
