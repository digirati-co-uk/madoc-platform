import React from 'react';
import { Table as OriginalTable } from '../../../frontend/shared/atoms/Table';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Table(props: Props) {
  return <OriginalTable {...props} />;
}

export default Table;