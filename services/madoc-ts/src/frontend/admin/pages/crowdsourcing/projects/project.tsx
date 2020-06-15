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
    const { data, status } = useData(Project);

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
            { label: t('Model'), link: `/projects/${data.id}/model` },
            { label: t('Crowdsourcing'), link: `/projects/${data.id}/tasks` },
          ]}
          title={<LocaleString>{data.label}</LocaleString>}
        />
        <WidePage>
          {renderUniversalRoutes(route.routes, { captureModelId: data.capture_model_id, project: data })}
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
