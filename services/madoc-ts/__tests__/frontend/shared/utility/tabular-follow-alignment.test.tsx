/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FollowActiveCellOnCanvas } from '../../../../src/frontend/admin/components/tabular/cast-a-net/FollowActiveCellOnCanvas';
import type { NetConfig } from '../../../../src/frontend/shared/utility/tabular-types';

let mockAfterFrame: () => void;
jest.mock('@atlas-viewer/atlas', () => ({
  useAfterFrame: (callback: () => void) => {
    mockAfterFrame = callback;
  },
}));

jest.mock('react-iiif-vault', () => ({ useCanvas: () => ({ width: 1000, height: 1000 }) }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

test('tracking follows changed column geometry and a resized viewport, synchronising the controller', () => {
  let screen = { width: 400, height: 400 };
  let viewport = { x: 0, y: 0, width: 400, height: 400 };
  const setViewport = jest.fn((next: typeof viewport) => {
    viewport = next;
  });
  const stopTransition = jest.fn();
  const updateControllerPosition = jest.fn();
  const runtimeRef = {
    current: {
      getViewport: () => viewport,
      getRendererScreenPosition: () => screen,
      setViewport,
      transitionManager: { stopTransition },
      updateControllerPosition,
    },
  };
  const root = createRoot(document.createElement('div'));
  const net: NetConfig = {
    left: 5,
    top: 10,
    width: 40,
    height: 20,
    cols: 2,
    rows: 2,
    colPositions: [50],
    rowPositions: [50],
    rowOffsetAdjustments: [],
  };
  const activeCell = { row: 0, col: 1 };
  try {
    act(() =>
      root.render(
        <FollowActiveCellOnCanvas runtimeRef={runtimeRef} runtimeTick={0} value={net} activeCell={activeCell} />
      )
    );
    const originalX = viewport.x;
    const aligned = { ...net, left: 35, width: 60 };
    act(() =>
      root.render(
        <FollowActiveCellOnCanvas runtimeRef={runtimeRef} runtimeTick={0} value={aligned} activeCell={activeCell} />
      )
    );
    expect(viewport.x).toBeGreaterThan(originalX);
    expect(viewport.x + viewport.width).toBeGreaterThanOrEqual(950);
    viewport = { x: 0, y: 0, width: 500, height: 900 };
    screen = { width: 500, height: 400 };
    act(() => mockAfterFrame());
    expect(viewport.height).toBe(400);
    expect(viewport.y + viewport.height / 2).toBe(150);
    expect(viewport.x + viewport.width).toBeGreaterThanOrEqual(950);
    expect(stopTransition).toHaveBeenCalledTimes(setViewport.mock.calls.length);
    expect(updateControllerPosition).toHaveBeenCalledTimes(setViewport.mock.calls.length);
  } finally {
    act(() => root.unmount());
  }
});

jest.mock(
  '@/frontend/shared/utility/tabular-row-offset-adjustments',
  () => jest.requireActual('../../../../src/frontend/shared/utility/tabular-row-offset-adjustments'),
  { virtual: true }
);
