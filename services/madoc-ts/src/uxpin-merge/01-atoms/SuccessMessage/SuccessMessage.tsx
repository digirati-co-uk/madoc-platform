import React from 'react';
import { SuccessMessage as OriginalSuccessMessage } from '../../../frontend/shared/atoms/SuccessMessage';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function SuccessMessage(props: Props) {
  return <OriginalSuccessMessage {...props} />;
}

export default SuccessMessage;