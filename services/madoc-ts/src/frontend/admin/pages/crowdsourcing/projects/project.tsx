import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useSite } from '../../../../shared/hooks/use-site';
import { UniversalComponent } from '../../../../types';
import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ProjectType = {
  params: { id: string };
  query: unknown;
  data: any;
  variables: { id: number };
};

export const Project: UniversalComponent<ProjectType> = createUniversalComponent<ProjectType>(
  ({ route }) => {
    const { t } = useTranslation();
    const { data, status, refetch } = useData(Project);
    const { slug } = useSite();
    const projectTemplate = useProjectTemplate(data?.template);

    const configFrozen = !!projectTemplate?.configuration?.frozen;
    const noModel = !!projectTemplate?.configuration?.captureModels?.noCaptureModel;
    const noActivity = !!projectTemplate?.configuration?.activity?.noActivity;

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
            !configFrozen ? { label: t('Configuration'), link: `/projects/${data.id}/configuration` } : null,
            !noModel ? { label: t('Model'), link: `/projects/${data.id}/model` } : null,
            { label: t('Crowdsourcing'), link: `/projects/${data.id}/tasks` },
            { label: t('Search index'), link: `/projects/${data.id}/search` },
            !noActivity ? { label: t('Activity'), link: `/projects/${data.id}/activity` } : null,
            { label: t('Export'), link: `/projects/${data.id}/export` },
            { label: t('Delete'), link: `/projects/${data.id}/delete` },
          ]}
          title={<LocaleString>{data.label}</LocaleString>}
          subtitle={
            <>
              <a href={`/s/${slug}/projects/${data.slug}`}>{t('Go to project on site')}</a>
            </>
          }
        />
        <WidePage>
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
