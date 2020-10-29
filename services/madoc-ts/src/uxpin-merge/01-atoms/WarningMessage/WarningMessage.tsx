import React from 'react';
import { WarningMessage as OriginalWarningMessage } from '../../../frontend/shared/atoms/WarningMessage';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function WarningMessage(props: Props) {
  return <OriginalWarningMessage {...props} />;
}

export default WarningMessage;