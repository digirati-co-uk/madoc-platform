import React from 'react';
import { StandardButton as OriginalStandardButton } from '../../../frontend/shared/atoms/StandardButton';

export type Props = {
  /**
   * @default 'medium'
   */
  size: 'large' | 'medium' | 'small';
  /**
   * @default 'primary'
   */
  variation: 'primary' | 'secondary' | 'tertiary';
  /**
   * @default true
   */
  stretched: boolean;
  /** The content to display inside the button */
  children?: string;
  /** Callback when clicked */
  onClick?(): void;
  /** Disables the button, disallowing merchant interaction */
  disabled?: boolean;
};

/**
 * @uxpincomponent
 */
function StandardButton({ size, variation, stretched = true, ...props }: Props) {
  return <OriginalStandardButton $stretched={stretched} $size={size} $variation={variation} {...props} />;
}

export default StandardButton;
