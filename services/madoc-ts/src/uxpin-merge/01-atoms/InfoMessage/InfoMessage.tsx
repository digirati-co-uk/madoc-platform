import React from 'react';
import { InfoMessage as OriginalInfoMessage } from '../../../frontend/shared/atoms/InfoMessage';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function InfoMessage(props: Props) {
  return <OriginalInfoMessage {...props} />;
}

export default InfoMessage;