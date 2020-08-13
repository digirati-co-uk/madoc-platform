import { UniversalComponent } from '../../../../types';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../shared/atoms/Button';
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
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
          {data.projects.map((project: any) => {
            return (
              <div key={project.id}>
                <h3>
                  <LocaleString as={Link} to={`/projects/${project.id}`}>
                    {project.label}
                  </LocaleString>
                </h3>
                <p>
                  <LocaleString>{project.summary}</LocaleString>
                </p>
              </div>
            );
          })}
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
