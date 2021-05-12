import React from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { useParams } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type ManifestViewType = {
  data: ManifestFull;
  query: { page?: number };
  params: { id: string };
  variables: { id: number; page: number };
};

export const ManifestView: UniversalComponent<ManifestViewType> = createUniversalComponent<ManifestViewType>(
  ({ route }) => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { resolvedData } = usePaginatedData(ManifestView);
    const { manifest, pagination } = resolvedData || {};

    const title = manifest ? <LocaleString>{manifest.label}</LocaleString> : '...';

    return (
      <>
        <AdminHeader
          title={title}
          subtitle={t('{{count}} canvases', { count: pagination ? pagination.totalResults : 0 })}
          breadcrumbs={[
            { label: 'Site admin', link: '/' },
            { label: 'Manifests', link: '/manifests' },
            { label: title, link: `/manifests/${id}`, active: true },
          ]}
          menu={[
            { label: t('Canvases'), link: `/manifests/${id}` },
            { label: t('Edit metadata'), link: `/manifests/${id}/metadata` },
            { label: t('Edit structure'), link: `/manifests/${id}/structure` },
            { label: t('Edit linking'), link: `/manifests/${id}/linking` },
            { label: t('Projects'), link: `/manifests/${id}/projects` },
            { label: t('Collections'), link: `/manifests/${id}/collections` },
            { label: t('OCR'), link: `/manifests/${id}/ocr` },
            { label: t('Delete'), link: `/manifests/${id}/delete` },
            { label: t('Search index'), link: `/manifests/${id}/search` },
          ]}
        />
        <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getManifestById(vars.id, vars.page);
    },
    getKey(params, query) {
      return ['manifests', { id: Number(params.id), page: query.page || 1 }];
    },
  }
);
