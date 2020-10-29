import React from 'react';
import { ImageGrid as OriginalImageGrid } from '../../../frontend/shared/atoms/ImageGrid';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ImageGrid(props: Props) {
  return <OriginalImageGrid {...props} />;
}

export default ImageGrid;