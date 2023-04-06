import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';

export const FlexSpacer = styled.div<{ size?: string; divider?: boolean }>`
  flex: 1 1 0;
  position: relative;
  height: ${props => {
    switch (props.size) {
      case 'sm':
        return '30px';
      case 'lg':
        return '100px';
      default:
        return '50px';
    }
  }};
  ${props =>
    props.divider === true &&
    css`
      :after {
        content: '';
        height: 2px;
        background-color: rgba(0, 0, 0, 0.07);
        left: 0;
        right: 0;
        top: 50%;
        margin: 0 1em;
        position: absolute;
      }
    `}
`;

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
                {value: 'sm', text: 'Small'},
                {value: 'md', text: 'Medium'},
                {value: 'lg', text: 'Large'},
            ],
        },
        divider: {
            label: 'divider',
            type: 'checkbox-field',
            inlineLabel: 'Show divider',
        },
    },
});
