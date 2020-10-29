import React from 'react';
import { ReorderTable as OriginalReorderTable } from '../../../frontend/shared/atoms/ReorderTable';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ReorderTable(props: Props) {
  return <OriginalReorderTable {...props} />;
}

export default ReorderTable;