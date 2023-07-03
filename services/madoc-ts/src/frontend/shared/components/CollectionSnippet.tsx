import React from 'react';
import { useTranslation } from 'react-i18next';
import { SnippetLarge, SnippetLargeProps } from '../atoms/SnippetLarge';
import { useApiCollection } from '../hooks/use-api-collection';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';
import { createLink } from '../utility/create-link';

export const CollectionSnippet: React.FC<{ id: number; projectId?: string | number } & Partial<SnippetLargeProps>> = ({
  id,
  projectId,
  ...props
}) => {
  const { data, failureCount } = useApiCollection(id);
  const { t } = useTranslation();

  if (failureCount) {
    return null;
  }

  if (!data) {
    return (
      <SnippetLarge
        label={'...'}
        subtitle={t('Collection')}
        summary={'...'}
        linkAs={HrefLink}
        buttonText={t('view collection')}
        link={createLink({ collectionId: id, projectId: projectId })}
        {...props}
      />
    );
  }

  const thumbnail = data.collection.thumbnail
    ? data.collection.thumbnail
    : data.collection.items[0] && data.collection.items[0].thumbnail
    ? data.collection.items[0].thumbnail
    : undefined;

  return (
    <SnippetLarge
      label={<LocaleString>{data.collection.label}</LocaleString>}
      subtitle={t('Collection with {{count}} manifests', { count: data.pagination.totalResults })}
      summary={<LocaleString>{data.collection.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText={t('view collection')}
      link={createLink({ collectionId: id, projectId: projectId })}
      {...props}
    />
  );
};
