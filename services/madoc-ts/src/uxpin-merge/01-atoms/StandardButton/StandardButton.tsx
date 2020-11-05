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
function StandardButton({ size, variation, ...props }: Props) {
  return <OriginalStandardButton $size={size} $variation={variation} {...props} />;
}

export default StandardButton;
