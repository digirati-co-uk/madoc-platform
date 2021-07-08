import React, { useMemo } from 'react';
import { NotFoundPage } from '../../../shared/components/NotFoundPage';
import { useProjectTemplate } from '../../../shared/hooks/use-project-template';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { CustomThemeProvider, nullTheme, useCustomTheme } from '../../../themes/helpers/CustomThemeProvider';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { ConfigProvider } from '../../features/SiteConfigurationContext';

type ProjectLoaderType = {
  params: { slug: string };
  query: unknown;
  variables: { slug: string };
  data: ProjectFull;
  context: { project: ProjectFull };
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  ({ route }) => {
    const { data: project, isError } = useStaticData(ProjectLoader);

    const ctx = useMemo(() => (project ? { id: project.slug, name: project.label } : undefined), [project]);
    const template = useProjectTemplate(project?.template);
    useCustomTheme(project?.template ? `project-template(${project?.template})` : '', template?.theme || nullTheme);

    if (isError) {
      return <NotFoundPage />;
    }

    return (
      <AutoSlotLoader>
        <ConfigProvider project={project?.config}>
          <BreadcrumbContext project={ctx}>
            {renderUniversalRoutes(route.routes, {
              project,
            })}
          </BreadcrumbContext>
        </ConfigProvider>
      </AutoSlotLoader>
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
