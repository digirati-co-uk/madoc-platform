import React from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasNavigation } from '../../../../shared/components/CanvasNavigation';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useLocation, useParams, useRouteMatch } from 'react-router-dom';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { CanvasFull } from '../../../../../types/schemas/canvas-full';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useApiManifest } from '../../../../shared/hooks/use-api-manifest';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';

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
    const match = useRouteMatch();
    const { pathname } = useLocation();
    const subRoute = pathname.slice(match.url.length + 1);
    const { id, manifestId } = params;
    const { data } = useData(CanvasView);
    const { data: manifestResponse } = useApiManifest(manifestId);

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
            {
              label: t('search index'),
              link: manifestId ? `/manifests/${manifestId}/canvases/${id}/search` : `/canvases/${id}/search`,
            },
            {
              label: t('transcription'),
              link: manifestId ? `/manifests/${manifestId}/canvases/${id}/plaintext` : `/canvases/${id}/plaintext`,
            },
          ]}
        />
        <WidePage>
          {renderUniversalRoutes(route.routes, { canvas, manifest: manifestResponse?.manifest })}
          <CanvasNavigation manifestId={manifestId} canvasId={id} admin subRoute={subRoute} />
        </WidePage>
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
