import React from 'react';
import { Button as AtomButton } from '../../frontend/shared/atoms/Button';

export type Props = {
  label: string;
  test?: string;
};

/**
 * @uxpincomponent
 */
function Button({ label, test = 'something' }: Props) {
  return <AtomButton>{label}</AtomButton>;
}

export default Button;
