import React from 'react';
import { useTranslation } from 'react-i18next';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useApiManifest } from '../hooks/use-api-manifest';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const ManifestSnippet: React.FC<{
  id: number;
  collectionId?: number;
  flat?: boolean;
  margin?: boolean;
  lightBackground?: boolean;
  size?: 'lg' | 'md' | 'sm';
  center?: boolean;
  buttonRole?: 'button' | 'link';
  containThumbnail?: boolean;
  smallLabel?: boolean;
  fluid?: boolean;
  interactive?: boolean;
}> = props => {
  const { data } = useApiManifest(props.id);
  const { t } = useTranslation();

  const link = props.collectionId
    ? `/collections/${props.collectionId}/manifests/${props.id}`
    : `/manifests/${props.id}`;

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
        center={props.center}
        buttonRole={props.buttonRole}
        containThumbnail={props.containThumbnail}
        flat={props.flat}
        fluid={props.fluid}
        interactive={props.interactive}
        lightBackground={props.lightBackground}
        size={props.size}
        smallLabel={props.smallLabel}
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
      center={props.center}
      buttonRole={props.buttonRole}
      containThumbnail={props.containThumbnail}
      flat={props.flat}
      fluid={props.fluid}
      interactive={props.interactive}
      lightBackground={props.lightBackground}
      size={props.size}
      smallLabel={props.smallLabel}
    />
  );
};
