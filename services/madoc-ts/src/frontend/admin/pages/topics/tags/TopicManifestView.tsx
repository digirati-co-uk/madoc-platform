import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../../shared/hooks/use-site';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Outlet, useParams } from 'react-router-dom';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useApiManifest } from '../../../../shared/hooks/use-api-manifest';

export function TopicManifestView() {
  const { t } = useTranslation();
  const { id, topic, topicType } = useParams<{ id: string; topic: string; topicType: string }>();
  const manifestData = useApiManifest(id);
  const manifest = manifestData.data?.manifest;
  const pagination = manifestData.data?.pagination;
  const site = useSite();
  const title = manifest ? <LocaleString>{manifest.label}</LocaleString> : '...';

  return (
    <>
      <AdminHeader
        title={title}
        subtitle={
          <>
            {t('{{count}} canvases', { count: pagination ? pagination.totalResults : 0 })}
            {' | '}
            <a href={`/s/${site.slug}/topics/${topicType}/${topic}/manifests/${id}`}>{t('View on site')}</a>
            {manifest && manifest.source ? (
              <>
                <br />
                {t('Source manifest')}{' '}
                <a href={manifest.source} target="_blank" rel="noreferrer">
                  {manifest.source}
                </a>
              </>
            ) : null}
          </>
        }
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Topics', link: '/topics' },
          { label: topicType, link: `/topics/${topicType}` },
          { label: topic, link: `/topics/${topicType}/${topic}` },
          { label: 'resources', link: `/topics/${topicType}/${topic}/items` },
          { label: title, link: `/topics/${topicType}/${topic}/manifests/${id}`, active: true },
        ]}
        menu={[
          { label: t('Canvases'), link: `/topics/${topicType}/${topic}/manifests/${id}` },
          { label: t('Tags'), link: `/topics/${topicType}/${topic}/manifests/${id}/tags` },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
