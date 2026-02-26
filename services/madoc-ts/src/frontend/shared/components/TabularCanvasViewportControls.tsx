import React from 'react';
import { CanvasViewerButton, CanvasViewerControls } from '../atoms/CanvasViewerGrid';
import { HomeIcon } from '../icons/HomeIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { PlusIcon } from '../icons/PlusIcon';

type TabularCanvasViewportControlsProps = {
  onHome: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  homeDisabled?: boolean;
  zoomOutDisabled?: boolean;
  zoomInDisabled?: boolean;
  style?: React.CSSProperties;
  leadingControls?: React.ReactNode;
};

export function TabularCanvasViewportControls({
  onHome,
  onZoomOut,
  onZoomIn,
  homeDisabled,
  zoomOutDisabled,
  zoomInDisabled,
  style,
  leadingControls,
}: TabularCanvasViewportControlsProps) {
  return (
    <CanvasViewerControls style={style}>
      {leadingControls}
      <CanvasViewerButton type="button" onClick={onHome} disabled={homeDisabled}>
        <HomeIcon title="Home" />
      </CanvasViewerButton>
      <CanvasViewerButton type="button" onClick={onZoomOut} disabled={zoomOutDisabled}>
        <MinusIcon title="Zoom out" />
      </CanvasViewerButton>
      <CanvasViewerButton type="button" onClick={onZoomIn} disabled={zoomInDisabled}>
        <PlusIcon title="Zoom in" />
      </CanvasViewerButton>
    </CanvasViewerControls>
  );
}
