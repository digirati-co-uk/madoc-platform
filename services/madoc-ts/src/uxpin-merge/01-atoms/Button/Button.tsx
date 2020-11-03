import React from 'react';
import { Button as AtomButton } from '../../../frontend/shared/atoms/Button';

export type Props = {
  children: string;
  /** @default false */
  subtitle?: boolean;
};

/**
 * @uxpincomponent
 */
function Button(props: Props) {
  return <AtomButton {...props} />;
}

export default Button;
