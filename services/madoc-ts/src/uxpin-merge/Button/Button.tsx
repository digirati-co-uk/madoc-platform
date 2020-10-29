import React, { ComponentProps } from 'react';
import { Button as AtomButton } from '../../frontend/shared/atoms/Button';

export type Props = ComponentProps<typeof AtomButton>;



/**
 * @uxpincomponent
 */
function Button(props: Props) {
  return <AtomButton {...props} />;
}

export default Button;
