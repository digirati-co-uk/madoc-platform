import { UniversalComponent } from '../../../../types';
import { createUniversalComponent, useData } from '../../../utility';
import React from 'react';
import { LocaleString } from '../../../molecules/LocaleString';
import { renderUniversalRoutes } from '../../../server-utils';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../atoms/WidePage';
import { useTranslation } from 'react-i18next';

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
          ]}
          title={<LocaleString>{data.label}</LocaleString>}
        />
        <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
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
