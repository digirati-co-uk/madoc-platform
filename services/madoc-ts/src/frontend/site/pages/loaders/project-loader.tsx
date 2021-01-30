import React, { useMemo } from 'react';
import { NotFoundPage } from '../../../shared/components/NotFoundPage';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { useParams, useRouteMatch } from 'react-router-dom';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { ConfigProvider } from '../../features/SiteConfigurationContext';

type ProjectLoaderType = {
  params: { slug: string };
  query: {};
  variables: { slug: string };
  data: ProjectFull;
  context: { project: ProjectFull };
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  ({ route }) => {
    const { data: project, isError } = useStaticData(ProjectLoader);
    const { slug } = useParams<{ slug: string }>();
    const { isExact } = useRouteMatch();

    const hide = project?.config.hideCompletedResources;

    const { data: collections } = apiHooks.getSiteCollection(() =>
      project && isExact ? [project.collection_id, { type: 'collection' }] : undefined
    );

    const { data: manifests } = apiHooks.getSiteCollection(() =>
      project && isExact
        ? [
            project.collection_id,
            hide
              ? {
                  type: 'manifest',
                  project_id: slug,
                  hide_status: '2,3',
                }
              : {
                  type: 'manifest',
                },
          ]
        : undefined
    );

    const ctx = useMemo(() => (project ? { id: project.slug, name: project.label } : undefined), [project]);

    if (isError) {
      return <NotFoundPage />;
    }

    return (
      <ConfigProvider project={project?.config}>
        <BreadcrumbContext project={ctx}>
          {renderUniversalRoutes(route.routes, {
            project,
            collections,
            manifests,
          })}
        </BreadcrumbContext>
      </ConfigProvider>
    );
  },
  {
    getKey: params => {
      return ['getSiteProject', { slug: params.slug }];
    },
    getData: async (key, variables, api) => {
      return await api.getSiteProject(variables.slug);
    },
  }
);
