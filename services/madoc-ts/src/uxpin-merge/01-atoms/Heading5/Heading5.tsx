import React from 'react';
import { Heading5 as OriginalHeading5 } from '../../../frontend/shared/atoms/Heading5';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Heading5(props: Props) {
  return <OriginalHeading5 {...props} />;
}

export default Heading5;