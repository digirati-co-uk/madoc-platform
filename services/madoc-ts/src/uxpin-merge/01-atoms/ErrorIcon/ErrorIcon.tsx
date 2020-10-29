import React from 'react';
import { ErrorIcon as OriginalErrorIcon } from '../../../frontend/shared/atoms/ErrorIcon';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ErrorIcon(props: Props) {
  return <OriginalErrorIcon {...props} />;
}

export default ErrorIcon;