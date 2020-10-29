import React from 'react';
import { Header as OriginalHeader } from '../../../frontend/shared/atoms/Header';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Header(props: Props) {
  return <OriginalHeader {...props} />;
}

export default Header;