import React from 'react';
import { MediaExplorerProps } from './MediaExplorer';

export const MediaExplorerPreview: React.FC<MediaExplorerProps> = props => {
  if (props.value) {
    return <img src={props.value.image} alt="media thumbnail" />;
  }

  return null;
};
