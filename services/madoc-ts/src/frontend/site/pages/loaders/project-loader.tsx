import { stringify } from 'query-string';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { InfoMessage } from '../../../shared/callouts/InfoMessage';
import { useLoginRedirect } from '../../../shared/components/UserBar';
import { useProjectTemplate } from '../../../shared/hooks/use-project-template';
import { useUser } from '../../../shared/hooks/use-site';
import { Button } from '../../../shared/navigation/Button';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { AvailableBlocks } from '../../../shared/page-blocks/available-blocks';
import { HrefLink } from '../../../shared/utility/href-link';
import { nullTheme, useCustomTheme } from '../../../themes/helpers/CustomThemeProvider';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../blocks/Breadcrumbs';
import { ProjectFull } from '../../../../types/project-full';
import { ConfigProvider } from '../../features/SiteConfigurationContext';
import { FooterImageGrid } from '../../blocks/FooterImageGrid';
import { Slot } from '../../../shared/page-blocks/slot';
import { ItemNotFound } from '../Item-not-found';

type ProjectLoaderType = {
  params: { slug: string };
  query: unknown;
  variables: [string];
  data: ProjectFull;
};

export const ProjectLoader: UniversalComponent<ProjectLoaderType> = createUniversalComponent<ProjectLoaderType>(
  () => {
    const { data: project, isError } = useStaticData(ProjectLoader);
    const redirect = useLoginRedirect(false);
    const { t } = useTranslation();
    const user = useUser();
    const ctx = useMemo(() => (project ? { id: project.slug, name: project.label } : undefined), [project]);
    const template = useProjectTemplate(project?.template);
    useCustomTheme(project?.template ? `project-template(${project?.template})` : '', template?.theme || nullTheme);

    if (isError || (project?.id === -1 && project.label.none && project.label.none[0] === 'Project not found')) {
      return (
        <BreadcrumbContext project={ctx}>
          <ItemNotFound />
        </BreadcrumbContext>
      );
    }

    return (
      <AutoSlotLoader>
        <ConfigProvider project={project?.config}>
          <BreadcrumbContext project={ctx}>
            {!user && project?.status === 1 ? (
              <InfoMessage $wide>
                {t('Please login to contribute to this project')}
                <Button style={{ marginLeft: '1em' }} $primary as={HrefLink} href={`/login?${stringify({ redirect })}`}>
                  {t('Login')}
                </Button>
              </InfoMessage>
            ) : null}
            <Outlet />
            <Slot layout="flex" name="project-footer">
              <AvailableBlocks>
                <FooterImageGrid />
              </AvailableBlocks>
            </Slot>
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
