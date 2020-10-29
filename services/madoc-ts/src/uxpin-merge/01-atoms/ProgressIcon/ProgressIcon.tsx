import React from 'react';
import { ProgressIcon as OriginalProgressIcon } from '../../../frontend/shared/atoms/ProgressIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ProgressIcon(props: Props) {
  return <OriginalProgressIcon {...props} />;
}

export default ProgressIcon;