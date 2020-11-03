import React from 'react';
import { CanvasStatus as OriginalCanvasStatus } from '../../../frontend/shared/atoms/CanvasStatus';

export type Props = {
  // Add props in here.
  status: 1 | 2 | 3;
};

/**
 * @uxpincomponent
 */
function CanvasStatus(props: Props) {
  return <OriginalCanvasStatus {...props} />;
}

export default CanvasStatus;
