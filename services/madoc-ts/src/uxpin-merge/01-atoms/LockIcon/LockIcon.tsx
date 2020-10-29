import React from 'react';
import { LockIcon as OriginalLockIcon } from '../../../frontend/shared/atoms/LockIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function LockIcon(props: Props) {
  return <OriginalLockIcon {...props} />;
}

export default LockIcon;