import React from 'react';
import { CloseIcon as OriginalCloseIcon } from '../../../frontend/shared/atoms/CloseIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function CloseIcon(props: Props) {
  return <OriginalCloseIcon {...props} />;
}

export default CloseIcon;