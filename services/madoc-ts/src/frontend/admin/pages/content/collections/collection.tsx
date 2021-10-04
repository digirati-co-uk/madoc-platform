import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../../shared/hooks/use-site';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { CollectionFull } from '../../../../../types/schemas/collection-full';
import { useParams } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { WidePage } from '../../../../shared/layout/WidePage';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

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
    const site = useSite();
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
            { label: t('Manifests'), link: `/collections/${id}` },
            { label: t('Edit metadata'), link: `/collections/${id}/metadata` },
            { label: t('Edit structure'), link: `/collections/${id}/structure` },
            { label: t('Projects'), link: `/collections/${id}/projects` },
            { label: t('Search index'), link: `/collections/${id}/search` },
            { label: t('Delete'), link: `/collections/${id}/delete` },
          ]}
          title={title}
          subtitle={
            <>
              {t('{{count}} manifests', { count: pagination.totalResults })}
              {' | '}
              <a href={`/s/${site.slug}/collections/${id}`}>{t('View on site')}</a>
            </>
          }
        />
        <WidePage>{renderUniversalRoutes(route.routes, { collection })}</WidePage>
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
