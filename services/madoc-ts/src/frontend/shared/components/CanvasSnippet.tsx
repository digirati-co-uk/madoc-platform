import React from 'react';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useApiCanvas } from '../hooks/use-api-canvas';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const CanvasSnippet: React.FC<{ id: number; manifestId?: number; collectionId?: number }> = props => {
  const { data } = useApiCanvas(props.id);

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
