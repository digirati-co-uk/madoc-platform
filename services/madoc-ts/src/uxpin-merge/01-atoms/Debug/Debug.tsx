import React from 'react';
import { Debug as OriginalDebug } from '../../../frontend/shared/atoms/Debug';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Debug(props: Props) {
  return <OriginalDebug {...props} />;
}

export default Debug;