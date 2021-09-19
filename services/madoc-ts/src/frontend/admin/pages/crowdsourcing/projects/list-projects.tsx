import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { ProjectContainer, ProjectStatus } from '../../../../shared/atoms/ProjectStatus';
import { UniversalComponent } from '../../../../types';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../shared/navigation/Button';
import { useData, usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ProjectList } from '../../../../../types/schemas/project-list';
import { Pagination } from '../../../molecules/Pagination';

type ListProjectsType = {
  params: {};
  query: { page: string };
  variables: { page: number };
  data: ProjectList;
};

export const ListProjects: UniversalComponent<ListProjectsType> = createUniversalComponent<ListProjectsType>(
  () => {
    const { t } = useTranslation();
    const { resolvedData: data, status } = usePaginatedData(ListProjects);

    if (!data || status === 'loading' || status === 'error') {
      return <div>Loading...</div>;
    }

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('Projects'), link: '/projects', active: true },
          ]}
          title={t('Projects')}
        />
        <WidePage>
          <Button as={Link} to={`/projects/create`}>
            {t('Create project')}
          </Button>

          <hr />

          {data?.projects.map(project => (
            <ProjectContainer $status={project.status} key={project.id}>
              <LocaleString as={Heading3}>{project.label}</LocaleString>
              <LocaleString as={Subheading3}>{project.summary}</LocaleString>
              <Button as={Link} to={`/projects/${project.id}`}>
                {t('Go to project')}
              </Button>
              <ProjectStatus status={project.status} template={project.template} />
            </ProjectContainer>
          ))}
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        </WidePage>
      </>
    );
  },
  {
    getData: async (key, { page }, api) => {
      return api.getProjects(page);
    },
    getKey: (params, query) => {
      return ['list-projects', { page: Number(query.page) }];
    },
  }
);
