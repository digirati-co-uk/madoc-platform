import React from 'react';
import { WidePage as OriginalWidePage } from '../../../frontend/shared/atoms/WidePage';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function WidePage(props: Props) {
  return <OriginalWidePage {...props} />;
}

export default WidePage;