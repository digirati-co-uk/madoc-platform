import React from 'react';
import { SubtaskProgress as OriginalSubtaskProgress } from '../../../frontend/shared/atoms/SubtaskProgress';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function SubtaskProgress(props: Props) {
  return <OriginalSubtaskProgress {...props} />;
}

export default SubtaskProgress;