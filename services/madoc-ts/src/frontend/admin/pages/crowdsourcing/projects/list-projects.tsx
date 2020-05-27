import { UniversalComponent } from '../../../../types';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { TinyButton } from '../../../../shared/atoms/Button';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ListProjectsType = {
  params: {};
  query: { page: string };
  variables: { page: number };
  data: any;
};

export const ListProjects: UniversalComponent<ListProjectsType> = createUniversalComponent<ListProjectsType>(
  () => {
    const { t } = useTranslation();
    const { data, status } = useData(ListProjects);

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
          <TinyButton as={Link} to={`/projects/create`}>
            {t('Create project')}
          </TinyButton>
          {data.map((project: any) => {
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
