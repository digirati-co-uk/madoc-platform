import React from 'react';
import { useApi } from '../hooks/use-api';
import { useQuery } from 'react-query';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const CanvasSnippet: React.FC<{ id: number; manifestId?: number; collectionId?: number }> = props => {
  const api = useApi();

  const { data } = useQuery(
    ['canvas', { id: props.id }],
    () => {
      return api.getCanvasById(props.id);
    },
    { refetchInterval: false, refetchOnWindowFocus: false, refetchOnMount: false, refetchIntervalInBackground: false }
  );

  const link =
    props.collectionId && props.manifestId
      ? `/collections/${props.collectionId}/manifests/${props.manifestId}/${props.id}`
      : props.manifestId
      ? `/manifests/${props.manifestId}/${props.id}`
      : `/canvases/${props.id}`;

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={`Canvas`}
        summary={'...'}
        linkAs={HrefLink}
        buttonText="view canvas"
        link={link}
      />
    );
  }

  const thumbnail = data.canvas.thumbnail;

  return (
    <SnippetLarge
      margin
      label={<LocaleString>{data.canvas.label}</LocaleString>}
      subtitle={`Canvas`}
      summary={<LocaleString>{data.canvas.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText="view canvas"
      link={link}
    />
  );
};
