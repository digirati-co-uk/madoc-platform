import React from 'react';
import styled from 'styled-components';
import { Surface, SurfaceProps } from './Surface';

const StackSlotLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlexSlotLayout = styled.div`
  display: flex;
  flex-direction: row;
`;

export const SlotLayout = React.forwardRef(function SlotLayout(
  {
    children,
    surfaceProps = {},
    layout,
  }: { layout?: 'none' | 'stack' | 'flex' | string; surfaceProps?: SurfaceProps; children: any },
  ref
) {
  if (layout === 'none') {
    return children;
  }

  if (layout === 'flex') {
    return (
      <Surface {...surfaceProps}>
        <FlexSlotLayout ref={ref as any}>{children}</FlexSlotLayout>
      </Surface>
    );
  }

  return (
    <Surface {...surfaceProps}>
      <StackSlotLayout ref={ref as any}>{children}</StackSlotLayout>
    </Surface>
  );
});
