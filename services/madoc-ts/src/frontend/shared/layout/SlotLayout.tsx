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
    id,
    editing,
    children,
    surfaceProps,
    layout,
    noSurface,
  }: {
    id?: string;
    layout?: 'none' | 'stack' | 'flex' | string;
    editing?: boolean;
    surfaceProps?: SurfaceProps;
    children: any;
    noSurface?: boolean;
  },
  ref
) {
  if (layout === 'none' && !editing) {
    return (
      <Surface id={id} {...surfaceProps}>
        {children}
      </Surface>
    );
  }

  if (layout === 'flex-center') {
    if (noSurface || !surfaceProps) {
      return (
        <FlexCenterLayout ref={ref as any} id={id}>
          {children}
        </FlexCenterLayout>
      );
    }
    return (
      <Surface id={id} {...surfaceProps}>
        <FlexCenterLayout ref={ref as any}>{children}</FlexCenterLayout>
      </Surface>
    );
  }

  if (layout === 'flex') {
    if (noSurface || !surfaceProps) {
      return (
        <FlexSlotLayout id={id} ref={ref as any}>
          {children}
        </FlexSlotLayout>
      );
    }
    return (
      <Surface {...surfaceProps}>
        <FlexSlotLayout id={id} ref={ref as any}>
          {children}
        </FlexSlotLayout>
      </Surface>
    );
  }

  if (noSurface || !surfaceProps) {
    return (
      <StackSlotLayout id={id} ref={ref as any}>
        {children}
      </StackSlotLayout>
    );
  }
  return (
    <Surface id={id} {...surfaceProps}>
      <StackSlotLayout ref={ref as any}>{children}</StackSlotLayout>
    </Surface>
  );
});
