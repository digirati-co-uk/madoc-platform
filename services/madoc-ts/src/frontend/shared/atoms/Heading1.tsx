import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';

export const Heading1 = styled.h1<{ $margin?: boolean }>`
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 0.2em;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;

blockEditorFor(Heading1, {
  type: 'heading-1',
  label: 'Heading 1',
  editor: {
    children: 'text-field',
  },
  defaultProps: {
    children: 'Example header',
  },
});

export const Subheading1 = styled.div`
  font-size: 1em;
  color: #999;
  margin-bottom: 1em;
  & a {
    color: #5071f4;
    font-size: 0.85em;
  }
`;
