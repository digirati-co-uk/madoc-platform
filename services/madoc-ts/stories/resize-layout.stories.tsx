import { text } from '@storybook/addon-knobs';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { useResizeLayout } from '../src/frontend/shared/hooks/use-resize-layout';

export default { title: 'Resize layout' };

const SomeDiv = styled.div`
  width: 500px;
  height: 500px;
  background: red;
`;

const SomeHandle = styled.div<{ $isDragging?: boolean }>`
  width: 10px;
  background: #eee;
  height: 500px;
  user-select: none;
  cursor: col-resize;
  &:hover,
  &:active {
    background: #ddd;
  }

  ${props =>
    props.$isDragging &&
    css`
      &,
      &:active,
      &:hover {
        background-color: blue;
      }
    `}
`;

function ResizeGrid() {
  const { isDragging, widthA, refs, widthB } = useResizeLayout('storybook-example');

  return (
    <div style={{ padding: 50 }}>
      <div ref={refs.container} style={{ display: 'flex', width: 600 }}>
        <SomeDiv style={{ flex: '1 1 0px', width: widthA }}>
          Test A: <strong>{widthA}px</strong>
        </SomeDiv>
        <SomeHandle ref={refs.resizer} $isDragging={isDragging} />
        <SomeDiv ref={refs.resizableDiv} style={{ width: widthB }}>
          Test B: <strong>{widthB}px</strong>
        </SomeDiv>
      </div>
    </div>
  );
}

export const ResizeLayoutDefault: React.FC = () => {
  return (
    <div>
      <ResizeGrid />
    </div>
  );
};
