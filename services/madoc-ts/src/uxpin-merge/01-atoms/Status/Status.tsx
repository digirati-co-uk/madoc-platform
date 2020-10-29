import React from 'react';
import { Status as OriginalStatus } from '../../../frontend/shared/atoms/Status';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Status(props: Props) {
  return <OriginalStatus {...props} />;
}

export default Status;