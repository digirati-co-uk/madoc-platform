import { ProjectStatus } from '../../../../shared/atoms/ProjectStatus';
import { useSite } from '../../../../shared/hooks/use-site';
import { UniversalComponent } from '../../../../types';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ProjectType = {
  params: { id: string };
  query: {};
  data: any;
  variables: { id: number };
};

export const Project: UniversalComponent<ProjectType> = createUniversalComponent<ProjectType>(
  ({ route }) => {
    const { t } = useTranslation();
    const { data, status, refetch } = useData(Project);
    const { slug } = useSite();

    if (!data || status === 'loading' || status === 'error') {
      return <div>loading...</div>;
    }

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('Projects'), link: '/projects' },
            { label: <LocaleString>{data.label}</LocaleString>, link: `/projects/${data.id}`, active: true },
          ]}
          menu={[
            { label: t('Overview'), link: `/projects/${data.id}` },
            { label: t('Details'), link: `/projects/${data.id}/metadata` },
            { label: t('Content'), link: `/projects/${data.id}/content` },
            { label: t('Configuration'), link: `/projects/${data.id}/configuration` },
            { label: t('Model'), link: `/projects/${data.id}/model` },
            { label: t('Crowdsourcing'), link: `/projects/${data.id}/tasks` },
            { label: t('Search'), link: `/projects/${data.id}/search` },
          ]}
          title={<LocaleString>{data.label}</LocaleString>}
          subtitle={
            <>
              <a href={`/s/${slug}/madoc/projects/${data.slug}`}>{t('Go to project on site')}</a>
            </>
          }
        />
        <WidePage>
          {data ? <ProjectStatus status={data.status} /> : null}
          {renderUniversalRoutes(route.routes, { captureModelId: data.capture_model_id, project: data, refetch })}
        </WidePage>
      </>
    );
  },
  {
    getData: async (key, { id }, api) => {
      return api.getProject(id);
    },
    getKey: params => {
      return ['get-project', { id: Number(params.id) }];
    },
  }
);
