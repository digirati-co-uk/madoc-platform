import React from 'react';
import { MoreButton as OriginalMoreButton } from '../../../frontend/shared/atoms/MoreButton';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function MoreButton(props: Props) {
  return <OriginalMoreButton {...props} />;
}

export default MoreButton;