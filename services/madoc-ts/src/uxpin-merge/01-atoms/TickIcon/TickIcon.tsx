import React from 'react';
import { TickIcon as OriginalTickIcon } from '../../../frontend/shared/atoms/TickIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function TickIcon(props: Props) {
  return <OriginalTickIcon {...props} />;
}

export default TickIcon;