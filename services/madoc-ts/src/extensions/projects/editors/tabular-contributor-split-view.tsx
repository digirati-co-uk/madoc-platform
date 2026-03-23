import React from 'react';
import { TabularSplitView } from '@/frontend/shared/components/TabularSplitView';

type TabularContributorSplitViewProps = {
  splitContainerRef: React.Ref<HTMLDivElement>;
  canvasSplitPct: number;
  splitDividerHeight: number;
  startCanvasTableResize: (event: React.MouseEvent<HTMLDivElement>) => void;
  isCanvasTableDividerActive: boolean;
  setIsCanvasTableDividerHover: (isHover: boolean) => void;
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
};

export function TabularContributorSplitView({
  splitContainerRef,
  canvasSplitPct,
  splitDividerHeight,
  startCanvasTableResize,
  isCanvasTableDividerActive,
  setIsCanvasTableDividerHover,
  topPanel,
  bottomPanel,
}: TabularContributorSplitViewProps) {
  return (
    <TabularSplitView
      containerRef={splitContainerRef}
      className="flex-1"
      topTrack={`minmax(0, ${canvasSplitPct}fr)`}
      bottomTrack={`minmax(0, ${100 - canvasSplitPct}fr)`}
      dividerHeight={splitDividerHeight}
      dividerAriaLabel="Resize canvas and table"
      onResizeStart={startCanvasTableResize}
      onDividerHoverChange={setIsCanvasTableDividerHover}
      isDividerActive={isCanvasTableDividerActive}
      topPanel={topPanel}
      bottomPanel={bottomPanel}
    />
  );
}
