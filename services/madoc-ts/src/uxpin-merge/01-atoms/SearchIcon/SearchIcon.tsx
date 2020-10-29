import React from 'react';
import { SearchIcon as OriginalSearchIcon } from '../../../frontend/shared/atoms/SearchIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function SearchIcon(props: Props) {
  return <OriginalSearchIcon {...props} />;
}

export default SearchIcon;