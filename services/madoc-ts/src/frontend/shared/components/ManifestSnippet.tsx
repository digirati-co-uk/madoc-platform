import React from 'react';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useApiManifest } from '../hooks/use-api-manifest';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const ManifestSnippet: React.FC<{ id: number; collectionId?: number }> = props => {
  const { data } = useApiManifest(props.id);

  const link = props.collectionId
    ? `/collections/${props.collectionId}/manifests/${props.id}`
    : `/manifests/${props.id}`;

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={`Manifest`}
        summary={'...'}
        linkAs={HrefLink}
        buttonText="view manifest"
        link={link}
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
      subtitle={`Manifest with ${data.pagination.totalResults} images`}
      summary={<LocaleString>{data.manifest.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText="view manifest"
      link={link}
    />
  );
};
