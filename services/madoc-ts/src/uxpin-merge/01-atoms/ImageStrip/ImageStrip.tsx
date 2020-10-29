import React from 'react';
import { ImageStrip as OriginalImageStrip } from '../../../frontend/shared/atoms/ImageStrip';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ImageStrip(props: Props) {
  return <OriginalImageStrip {...props} />;
}

export default ImageStrip;