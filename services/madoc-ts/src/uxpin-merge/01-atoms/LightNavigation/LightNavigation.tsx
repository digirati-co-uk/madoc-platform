import React from 'react';
import { LightNavigation as OriginalLightNavigation } from '../../../frontend/shared/atoms/LightNavigation';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function LightNavigation(props: Props) {
  return <OriginalLightNavigation {...props} />;
}

export default LightNavigation;