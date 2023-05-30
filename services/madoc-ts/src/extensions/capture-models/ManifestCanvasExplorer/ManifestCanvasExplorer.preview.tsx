import React from 'react';
import { LocaleString } from '../../../frontend/shared/components/LocaleString';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { ManifestCanvasExplorerProps } from './ManifestCanvasExplorer';

export const ManifestCanvasExplorerPreview: React.FC<ManifestCanvasExplorerProps> = props => {
  if (props.value) {
    return <Heading5 as={LocaleString}>{props.value.label}</Heading5>;
  }

  return null;
};
