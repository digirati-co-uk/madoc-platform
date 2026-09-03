import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';

interface FlexSpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string;
  divider?: boolean;
}

export function FlexSpacer({ size, divider, className, ...props }: FlexSpacerProps) {
  const heightClass = size === 'sm' ? 'h-[30px]' : size === 'lg' ? 'h-[100px]' : 'h-[50px]';

  return (
    <div
      {...props}
      className={`relative flex-[1_1_0] ${heightClass} ${
        divider
          ? "after:absolute after:inset-x-[1em] after:top-1/2 after:h-0.5 after:bg-black/[0.07] after:content-['']"
          : ''
      } ${className || ''}`}
    />
  );
}

blockEditorFor(FlexSpacer, {
  type: 'default.FlexSpacer',
  label: 'Spacer',
  defaultProps: {
    size: '',
    divider: false,
  },
  editor: {
    size: {
      label: 'size',
      type: 'dropdown-field',
      options: [
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Medium' },
        { value: 'lg', text: 'Large' },
      ],
    },
    divider: {
      label: 'divider',
      type: 'checkbox-field',
      inlineLabel: 'Show divider',
    },
  },
});
