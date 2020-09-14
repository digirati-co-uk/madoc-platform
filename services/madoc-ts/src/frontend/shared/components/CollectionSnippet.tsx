import React from 'react';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useApiCollection } from '../hooks/use-api-collection';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';
import { createLink } from '../utility/create-link';

export const CollectionSnippet: React.FC<{ id: number; projectId?: string | number }> = props => {
  const { data, failureCount } = useApiCollection(props.id);

  if (failureCount) {
    return null;
  }

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={`Collection`}
        summary={'...'}
        linkAs={HrefLink}
        buttonText="view collection"
        link={createLink({ collectionId: props.id, projectId: props.projectId })}
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
      margin
      label={<LocaleString>{data.collection.label}</LocaleString>}
      subtitle={`Collection with ${data.pagination.totalResults} manifests`}
      summary={<LocaleString>{data.collection.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText="view collection"
      link={createLink({ collectionId: props.id, projectId: props.projectId })}
    />
  );
};
