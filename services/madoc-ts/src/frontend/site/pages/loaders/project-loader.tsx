import { stringify } from 'query-string';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InfoMessage } from '../../../shared/callouts/InfoMessage';
import { NotFoundPage } from '../../../shared/components/NotFoundPage';
import { useLoginRedirect } from '../../../shared/components/UserBar';
import { useProjectTemplate } from '../../../shared/hooks/use-project-template';
import { useUser } from '../../../shared/hooks/use-site';
import { Button } from '../../../shared/navigation/Button';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { HrefLink } from '../../../shared/utility/href-link';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { nullTheme, useCustomTheme } from '../../../themes/helpers/CustomThemeProvider';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ProjectFull } from '../../../../types/project-full';
import { ConfigProvider } from '../../features/SiteConfigurationContext';

type ProjectLoaderType = {
  params: { slug: string };
  query: unknown;
  variables: [string];
  data: ProjectFull;
  context: { project: ProjectFull };
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  ({ route }) => {
    const { data: project, isError } = useStaticData(ProjectLoader);
    const redirect = useLoginRedirect(false);
    const { t } = useTranslation();
    const user = useUser();
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
            {!user ? (
              <InfoMessage $wide>
                {t('Please login to contribute to this project')}
                <Button style={{ marginLeft: '1em' }} $primary as={HrefLink} href={`/login?${stringify({ redirect })}`}>
                  Login
                </Button>
              </InfoMessage>
            ) : null}
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
      return ['getSiteProject', [params.slug]];
    },
    getData: async (key, variables, api) => {
      return await api.getSiteProject(...variables);
    },
  }
);
