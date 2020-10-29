import React from 'react';
import { NotStartedIcon as OriginalNotStartedIcon } from '../../../frontend/shared/atoms/NotStartedIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function NotStartedIcon(props: Props) {
  return <OriginalNotStartedIcon {...props} />;
}

export default NotStartedIcon;