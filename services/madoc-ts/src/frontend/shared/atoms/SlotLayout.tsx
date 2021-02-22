import React from 'react';
import styled from 'styled-components';

const StackSlotLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlexSlotLayout = styled.div`
  display: flex;
  flex-direction: row;
`;

export const SlotLayout = React.forwardRef(function SlotLayout(
  { children, layout }: { layout?: 'none' | 'stack' | 'flex' | string; children: any },
  ref
) {
  if (layout === 'flex') {
    return <FlexSlotLayout ref={ref as any}>{children}</FlexSlotLayout>;
  }

  return <StackSlotLayout ref={ref as any}>{children}</StackSlotLayout>;
});
