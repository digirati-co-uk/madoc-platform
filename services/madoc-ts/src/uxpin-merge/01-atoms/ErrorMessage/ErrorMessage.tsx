import React from 'react';
import { ErrorMessage as OriginalErrorMessage } from '../../../frontend/shared/atoms/ErrorMessage';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ErrorMessage(props: Props) {
  return <OriginalErrorMessage {...props} />;
}

export default ErrorMessage;