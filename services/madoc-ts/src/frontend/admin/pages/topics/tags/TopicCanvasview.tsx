import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../../shared/hooks/use-site';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Outlet, useParams } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useApiCanvas } from '../../../../shared/hooks/use-api-canvas';
import { useApiManifest } from '../../../../shared/hooks/use-api-manifest';

export function TopicCanvasView() {
  const { t } = useTranslation();
  const { id, topic, topicType, manifestId } = useParams<{
    id: string;
    topic: string;
    topicType: string;
    manifestId: string;
  }>();
  const canvasData = useApiCanvas(id);
  const canvas = canvasData.data?.canvas;

  const site = useSite();
  const { data: manifestResponse } = useApiManifest(manifestId);
  const manifestTitle = manifestId ? (
    manifestResponse?.manifest.label ? (
      <LocaleString>{manifestResponse.manifest.label}</LocaleString>
    ) : (
      '...'
    )
  ) : (
    ''
  );
  const title = canvas ? canvas.label ? <LocaleString>{canvas.label}</LocaleString> : 'Untitled' : '...';
  const thumbnail = canvas && canvas.thumbnail && canvas.thumbnail[0] ? canvas.thumbnail[0].id : undefined;
  return (
    <>
      <AdminHeader
        title={title}
        thumbnail={thumbnail}
        subtitle={
          <>
            <a href={`/s/${site.slug}/topics/${topicType}/${topic}/manifests/${manifestId}/c/${id}`}>
              {t('View on site')}
            </a>
          </>
        }
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Topics', link: '/topics' },
          { label: topicType, link: `/topics/${topicType}` },
          { label: topic, link: `/topics/${topicType}/${topic}/items` },
          { label: manifestTitle, link: `/topics/${topicType}/${topic}/manifests/${manifestId}` },
          { label: title, link: `/topics/${topicType}/${topic}/manifests/${manifestId}/canvases/${id}`, active: true },
        ]}
        menu={[
          { label: t('Deep zoom'), link: `/topics/${topicType}/${topic}/manifests/${manifestId}/canvases/${id}` },
          { label: t('Tags'), link: `/topics/${topicType}/${topic}/manifests/${manifestId}/canvases/${id}/tags` },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
