import React from 'react';
import { Grid as OriginalGrid } from '../../../frontend/shared/atoms/Grid';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Grid(props: Props) {
  return <OriginalGrid {...props} />;
}

export default Grid;