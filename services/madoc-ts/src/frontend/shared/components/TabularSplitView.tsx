import React from 'react';
import { VerticalResizeSeparator } from './VerticalResizeSeparator';

type TabularSplitViewProps = {
  containerRef?: React.Ref<HTMLDivElement>;
  topTrack: string;
  bottomTrack: string;
  dividerHeight: number;
  dividerAriaLabel: string;
  onResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDividerHoverChange?: (isHover: boolean) => void;
  isDividerActive?: boolean;
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  topPanelClassName?: string;
  topPanelStyle?: React.CSSProperties;
  bottomPanelClassName?: string;
  bottomPanelStyle?: React.CSSProperties;
  dividerClassName?: string;
  dividerStyle?: React.CSSProperties;
  dividerChildren?: React.ReactNode;
};

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function DefaultDividerHandle({ active }: { active: boolean }) {
  const barColor = active ? '#181818' : '#a1a1a1';

  return (
    <div style={{ display: 'grid', gap: 2 }}>
      <div style={{ width: 16, height: 2, background: barColor }} />
      <div style={{ width: 16, height: 2, background: barColor }} />
    </div>
  );
}

export function TabularSplitView({
  containerRef,
  topTrack,
  bottomTrack,
  dividerHeight,
  dividerAriaLabel,
  onResizeStart,
  onDividerHoverChange,
  isDividerActive = false,
  topPanel,
  bottomPanel,
  className,
  style,
  topPanelClassName,
  topPanelStyle,
  bottomPanelClassName,
  bottomPanelStyle,
  dividerClassName,
  dividerStyle,
  dividerChildren,
}: TabularSplitViewProps) {
  return (
    <div
      ref={containerRef}
      className={joinClasses('grid h-full min-h-0 min-w-0 overflow-hidden', className)}
      style={{
        gridTemplateRows: `${topTrack} ${dividerHeight}px ${bottomTrack}`,
        ...style,
      }}
    >
      <div
        className={joinClasses('grid h-full min-h-0 min-w-0 overflow-hidden', topPanelClassName)}
        style={{
          gridTemplateRows: 'minmax(0, 1fr)',
          ...topPanelStyle,
        }}
      >
        {topPanel}
      </div>

      <VerticalResizeSeparator
        ariaLabel={dividerAriaLabel}
        onResizeStart={onResizeStart}
        onHoverChange={onDividerHoverChange}
        className={joinClasses('flex items-center justify-center', dividerClassName)}
        style={{
          cursor: 'row-resize',
          userSelect: 'none',
          background: isDividerActive ? '#a1a1a1' : '#ddd',
          ...dividerStyle,
        }}
      >
        {dividerChildren ?? <DefaultDividerHandle active={isDividerActive} />}
      </VerticalResizeSeparator>

      <div
        className={joinClasses('grid h-full min-h-0 min-w-0', bottomPanelClassName)}
        style={{
          gridTemplateRows: 'minmax(0, 1fr)',
          ...bottomPanelStyle,
        }}
      >
        {bottomPanel}
      </div>
    </div>
  );
}
