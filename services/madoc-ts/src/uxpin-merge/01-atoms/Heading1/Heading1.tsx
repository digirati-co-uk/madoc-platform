import React from 'react';
import { Heading1 as OriginalHeading1 } from '../../../frontend/shared/atoms/Heading1';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Heading1(props: Props) {
  return <OriginalHeading1 {...props} />;
}

export default Heading1;