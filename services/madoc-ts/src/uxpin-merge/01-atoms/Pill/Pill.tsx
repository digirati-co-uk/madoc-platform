import React from 'react';
import { Pill as OriginalPill } from '../../../frontend/shared/atoms/Pill';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Pill(props: Props) {
  return <OriginalPill {...props} />;
}

export default Pill;