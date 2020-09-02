import React from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Subheading1 } from '../../../../shared/atoms/Heading1';
import { ButtonRow, SmallButton } from '../../../../shared/atoms/Button';
import { Link, useParams, useLocation } from 'react-router-dom';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { CanvasFull } from '../../../../../types/schemas/canvas-full';
import { ContextHeading, Header } from '../../../../shared/atoms/Header';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { useQuery } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';

type CanvasViewType = {
  data: CanvasFull;
  query: {};
  params: { id: string };
  variables: { id: number };
  context: { manifest?: ManifestFull['manifest'] };
};

export const CanvasView: UniversalComponent<CanvasViewType> = createUniversalComponent<CanvasViewType>(
  ({ route }) => {
    const { t } = useTranslation();
    const params = useParams<{ id: string; manifestId?: string }>();
    const { id, manifestId } = params;
    const location = useLocation();
    const api = useApi();

    const { data, status } = useData(CanvasView);

    const { data: manifestResponse } = useQuery(['admin-manifest', { id: manifestId }], async () => {
      return manifestId ? api.getManifestById(Number(manifestId)) : undefined;
    });

    const { canvas } = data || {};
    const title = canvas ? canvas.label ? <LocaleString>{canvas.label}</LocaleString> : 'Untitled' : '...';
    const manifestTitle = manifestId ? (
      manifestResponse?.manifest.label ? (
        <LocaleString>{manifestResponse.manifest.label}</LocaleString>
      ) : (
        '...'
      )
    ) : (
      ''
    );

    return (
      <>
        <AdminHeader
          title={title}
          thumbnail={canvas?.thumbnail}
          subtitle={t('{{count}} canvases')}
          breadcrumbs={
            manifestId
              ? [
                  { label: 'Site admin', link: '/' },
                  { label: 'Manifests', link: '/manifests' },
                  { label: manifestTitle, link: `/manifests/${manifestId}` },
                  { label: title, link: `/manifests/${manifestId}/canvases/${id}`, active: true },
                ]
              : [
                  { label: 'Site admin', link: '/' },
                  { label: 'Manifests', link: '/canvases' },
                  { label: title, link: `/canvases/${id}`, active: true },
                ]
          }
          menu={[
            {
              label: t('deep zoom'),
              link: manifestId ? `/manifests/${manifestId}/canvases/${id}` : `/canvases/${id}`,
            },
            {
              label: t('edit metadata'),
              link: manifestId ? `/manifests/${manifestId}/canvases/${id}/metadata` : `/canvases/${id}/metadata`,
            },
            {
              label: t('edit linking'),
              link: manifestId ? `/manifests/${manifestId}/canvases/${id}/linking` : `/canvases/${id}/linking`,
            },
          ]}
        />
        <WidePage>{renderUniversalRoutes(route.routes, { canvas, manifest: manifestResponse?.manifest })}</WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCanvasById(vars.id);
    },
    getKey(params) {
      return ['view-canvas', { id: Number(params.id) }];
    },
  }
);
