import React from 'react';
import { SearchBox as OriginalSearchBox } from '../../../frontend/shared/atoms/SearchBox';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function SearchBox(props: Props) {
  return <OriginalSearchBox {...props} />;
}

export default SearchBox;