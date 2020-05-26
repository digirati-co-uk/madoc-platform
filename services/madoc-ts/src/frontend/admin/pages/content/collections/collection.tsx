import React from 'react';
import { useTranslation } from 'react-i18next';
import { createUniversalComponent, usePaginatedData } from '../../../utility';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../molecules/LocaleString';
import { CollectionFull } from '../../../../../types/schemas/collection-full';
import { useParams } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { renderUniversalRoutes } from '../../../server-utils';
import { WidePage } from '../../../atoms/WidePage';

type CollectionViewType = {
  data: CollectionFull;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const CollectionView: UniversalComponent<CollectionViewType> = createUniversalComponent<CollectionViewType>(
  ({ route }) => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { resolvedData, status } = usePaginatedData(CollectionView);

    if (status === 'error') {
      return <div>Something went wrong</div>;
    }

    const { collection, pagination } = resolvedData || {
      collection: { label: { none: ['...'] } },
      pagination: { totalResults: 0 },
    };

    const title = <LocaleString>{collection.label}</LocaleString>;

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'Collections', link: '/collections' },
            { label: title, link: '/collections', active: true },
          ]}
          menu={[
            { label: t('manifests'), link: `/collections/${id}` },
            { label: t('edit metadata'), link: `/collections/${id}/metadata` },
            { label: t('edit structure'), link: `/collections/${id}/structure` },
            { label: t('projects'), link: `/collections/${id}/projects` },
          ]}
          title={title}
          subtitle={t('{{count}} manifests', { count: pagination.totalResults })}
        />
        <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCollectionById(vars.id, vars.page);
    },
    getKey(params, query) {
      return ['collections', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
