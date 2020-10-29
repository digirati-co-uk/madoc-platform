import React from 'react';
import { Statistics as OriginalStatistics } from '../../../frontend/shared/atoms/Statistics';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Statistics(props: Props) {
  return <OriginalStatistics {...props} />;
}

export default Statistics;