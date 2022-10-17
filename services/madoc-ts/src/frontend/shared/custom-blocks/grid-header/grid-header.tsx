import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { Wrapper, Title } from './grid-header.style';

export function GridHeader(props: { header: string; color?: string }) {
  return (
    <Wrapper>
      <Title color={props.color}>{props.header}</Title>
    </Wrapper>
  );
}

blockEditorFor(GridHeader, {
  type: 'grid-header',
  label: 'Grid Header',
  defaultProps: {
    header: 'Explore all items in this Manifest', // This will pre-populate the form
    color: '',
  },
  editor: {
    header: { label: 'Enter a header', type: 'text-field' },
    color: { label: 'Text color', type: 'color-field' }
  },
});
