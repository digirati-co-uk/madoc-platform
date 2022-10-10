import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { Wrapper, Title, StyledTriangles } from './grid-header.style';

export function GridHeader(props: { header: string }) {
  return (
    <Wrapper>
      <StyledTriangles xmlns="http://www.w3.org/2000/svg" width="103.999" height="208" viewBox="0 0 103.999 208">
        <defs></defs>
        <path
          id="Path_129"
          data-name="Path 129"
          className="cls-1"
          d="M-2600,12467v-52h52l-51.888,52Zm52-52h0ZM-2548,12415Zm0,0h0Zm-52,0v-52h52l-51.888,52Zm52-52v-52h52l-51.888,52Zm0,0h0ZM-2548,12363Zm0,0h0Zm-52,0v-52h52l-51.888,52Zm52-52v-52h52l-51.888,52Zm0,0h0ZM-2548,12311Zm0,0h0Zm-52,0v-52h52l-51.888,52Zm52-52h0ZM-2548,12259Zm0,0h0Z"
          transform="translate(2600 -12259)"
        />
      </StyledTriangles>
      <Title>{props.header}</Title>
    </Wrapper>
  );
}

blockEditorFor(GridHeader, {
  type: 'grid-header',
  label: 'Grid Header',
  defaultProps: {
    header: 'Explore all items in this Manifest', // This will pre-populate the form
  },
  editor: {
    header: { label: 'Enter a header', type: 'text-field' },
  },
});
