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
  flex: 1 1 0px;
`;

const FlexCenterLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  flex: 1 1 0px;
`;

export const SlotLayout = React.forwardRef(function SlotLayout(
  {
    editing,
    children,
    surfaceProps,
    layout,
    noSurface,
  }: {
    layout?: 'none' | 'stack' | 'flex' | string;
    editing?: boolean;
    surfaceProps?: SurfaceProps;
    children: any;
    noSurface?: boolean;
  },
  ref
) {
  if (layout === 'none' && !editing) {
    return children;
  }

  if (layout === 'flex-center') {
    if (noSurface || !surfaceProps) {
      return <FlexCenterLayout ref={ref as any}>{children}</FlexCenterLayout>;
    }
    return (
      <Surface {...surfaceProps}>
        <FlexCenterLayout ref={ref as any}>{children}</FlexCenterLayout>
      </Surface>
    );
  }

  if (layout === 'flex') {
    if (noSurface || !surfaceProps) {
      return <FlexSlotLayout ref={ref as any}>{children}</FlexSlotLayout>;
    }
    return (
      <Surface {...surfaceProps}>
        <FlexSlotLayout ref={ref as any}>{children}</FlexSlotLayout>
      </Surface>
    );
  }

  if (noSurface || !surfaceProps) {
    return <StackSlotLayout ref={ref as any}>{children}</StackSlotLayout>;
  }
  return (
    <Surface {...surfaceProps}>
      <StackSlotLayout ref={ref as any}>{children}</StackSlotLayout>
    </Surface>
  );
});
