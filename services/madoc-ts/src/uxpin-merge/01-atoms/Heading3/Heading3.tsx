import React from 'react';
import { Heading3 as OriginalHeading3 } from '../../../frontend/shared/atoms/Heading3';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Heading3(props: Props) {
  return <OriginalHeading3 {...props} />;
}

export default Heading3;