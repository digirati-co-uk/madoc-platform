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
  hideHomeAndZoomControls?: boolean;
  className?: string;
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
  hideHomeAndZoomControls,
  className,
  style,
  leadingControls,
}: TabularCanvasViewportControlsProps) {
  return (
    <CanvasViewerControls className={className} style={style}>
      {leadingControls}
      {!hideHomeAndZoomControls ? (
        <>
          <CanvasViewerButton type="button" onClick={onHome} disabled={homeDisabled}>
            <HomeIcon title="Home" />
          </CanvasViewerButton>
          <CanvasViewerButton type="button" onClick={onZoomOut} disabled={zoomOutDisabled}>
            <MinusIcon title="Zoom out" />
          </CanvasViewerButton>
          <CanvasViewerButton type="button" onClick={onZoomIn} disabled={zoomInDisabled}>
            <PlusIcon title="Zoom in" />
          </CanvasViewerButton>
        </>
      ) : null}
    </CanvasViewerControls>
  );
}
