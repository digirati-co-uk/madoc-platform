import React from 'react';
import { Images as OriginalImages } from '../../../frontend/shared/atoms/Images';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Images(props: Props) {
  return <OriginalImages {...props} />;
}

export default Images;