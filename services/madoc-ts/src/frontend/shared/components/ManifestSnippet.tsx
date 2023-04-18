import React from 'react';
import { useTranslation } from 'react-i18next';
import { SnippetLarge, SnippetLargeProps } from '../atoms/SnippetLarge';
import { useApiManifest } from '../hooks/use-api-manifest';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const ManifestSnippet: React.FC<{
  id: number;
  collectionId?: number;
  snippetExpanded?: boolean;
} & Partial<SnippetLargeProps>> = ({ id, collectionId, snippetExpanded, ...props }) => {
  const { data } = useApiManifest(id);
  const { t } = useTranslation();

  const link = collectionId ? `/collections/${collectionId}/manifests/${id}` : `/manifests/${id}`;

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={t(`Manifest`)}
        summary={'...'}
        linkAs={HrefLink}
        buttonText={t('view manifest')}
        link={link}
        {...props}
      />
    );
  }

  const thumbnail = data.manifest.thumbnail
    ? data.manifest.thumbnail
    : data.manifest.items[0] && data.manifest.items[0].thumbnail
    ? data.manifest.items[0].thumbnail
    : undefined;

  return (
    <SnippetLarge
      margin
      label={<LocaleString>{data.manifest.label}</LocaleString>}
      subtitle={t('Manifest with {{count}} images', { count: data.pagination.totalResults })}
      summary={<LocaleString>{data.manifest.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText={t('view manifest')}
      link={link}
      {...props}
    />
  );
};
