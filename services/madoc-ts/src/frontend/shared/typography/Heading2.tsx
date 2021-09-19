import React from 'react';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';

export const Heading2 = styled.h2<{ $margin?: boolean }>`
  font-size: 1.75em;
  font-weight: 600;
  margin-bottom: 0.2em;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;

blockEditorFor(Heading2, {
  type: 'heading-2',
  label: 'Heading 2',
  editor: {
    text: { label: 'Text content', type: 'text-field' },
  },
  defaultProps: {
    text: 'Example header',
  },
  svgIcon: props => {
    return (
      <svg width="1em" height="1em" viewBox="0 0 177 127" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h177v127H0z" />
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize={53} fontWeight="bold" fill="#000">
            <tspan x={57.075} y={84}>
              {'h2'}
            </tspan>
          </text>
        </g>
      </svg>
    );
  },
  mapToProps: props => ({
    children: <>{props.text}</>,
  }),
});
