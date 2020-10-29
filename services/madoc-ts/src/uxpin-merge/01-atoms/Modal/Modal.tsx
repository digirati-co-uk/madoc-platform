import React from 'react';
import { Modal as OriginalModal } from '../../../frontend/shared/atoms/Modal';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function Modal(props: Props) {
  return <OriginalModal {...props} />;
}

export default Modal;