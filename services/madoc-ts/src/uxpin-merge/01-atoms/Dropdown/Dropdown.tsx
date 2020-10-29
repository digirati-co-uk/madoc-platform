import React from 'react';
import { Dropdown as OriginalDropdown } from '../../../frontend/shared/atoms/Dropdown';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Dropdown(props: Props) {
  return <OriginalDropdown {...props} />;
}

export default Dropdown;