import React from 'react';
import { Input as OriginalInput } from '../../../frontend/shared/atoms/Input';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Input(props: Props) {
  return <OriginalInput {...props} />;
}

export default Input;