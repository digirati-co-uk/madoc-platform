import React from 'react';
import { MaximiseWindow as OriginalMaximiseWindow } from '../../../frontend/shared/atoms/MaximiseWindow';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function MaximiseWindow(props: Props) {
  return <OriginalMaximiseWindow {...props} />;
}

export default MaximiseWindow;