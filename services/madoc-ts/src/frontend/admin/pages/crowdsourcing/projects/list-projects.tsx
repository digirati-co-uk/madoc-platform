import { ProjectBanner } from '../../../../shared/components/ProjectBanner';
import { SystemCallToAction } from '../../../../shared/components/SystemCallToAction';
import { UniversalComponent } from '../../../../types';
import React from 'react';
import { Link } from 'react-router-dom';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ProjectList } from '../../../../../types/schemas/project-list';
import { Pagination } from '../../../molecules/Pagination';
import { SystemBackground } from '../../../../shared/atoms/SystemUI';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';

type ListProjectsType = {
  params: unknown;
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
          noMargin
        />
        <SystemBackground>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SystemCallToAction
              title={'Create a new project'}
              href={`/projects/create`}
              description={'Get started with a template or create a custom project'}
            />

            {data?.projects.map(project => (
              <ProjectBanner key={project.id} project={project} admin status />
            ))}
          </div>
          <Pagination
            page={data ? data.pagination.page : 1}
            totalPages={data ? data.pagination.totalPages : 1}
            stale={!data}
          />
        </SystemBackground>
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
