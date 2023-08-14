import React from 'react';
import { useModelTranslation } from '../hooks/use-model-translation';

export function ModelTranslation(props: { children?: string }) {
  const { t: tModel } = useModelTranslation();
  if (!props.children) {
    return null;
  }
  if (props.children.includes(':')) {
    const converted = tModel(props.children.replace(':', '&#58;'));
    return <span dangerouslySetInnerHTML={{ __html: converted }} />;
  }
  return <>{tModel(props.children)}</>;
}
