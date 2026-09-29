import { getTabularCellBounds } from '../../../../src/frontend/admin/components/tabular/cast-a-net/tabular-cell-bounds';
import { fitTabularAlignment } from '../../../../src/frontend/shared/utility/tabular-heading-home';
import type { NetConfig } from '../../../../src/frontend/shared/utility/tabular-types';

test('alignment stops an old animation and fits the full image using the resized viewer dimensions', () => {
  const calls: string[] = [];
  let screen = { width: 1000, height: 300 };
  let viewport = { x: 800, y: 400, width: 200, height: 100 };
  const runtime = {
    world: { width: 6000, height: 4000 },
    getRendererScreenPosition: () => screen,
    transitionManager: { stopTransition: () => calls.push('stop') },
    setViewport: (next: typeof viewport) => {
      calls.push('set');
      viewport = next;
    },
    updateControllerPosition: () => calls.push('sync'),
  };
  const net: NetConfig = {
    left: 5,
    top: 10,
    width: 90,
    height: 80,
    rows: 2,
    cols: 2,
    rowPositions: [50],
    colPositions: [50],
    rowOffsetAdjustments: [],
  };
  expect(fitTabularAlignment(runtime, net)).toBe(true);
  expect(calls).toEqual(['stop', 'set', 'sync']);
  expect(viewport.x).toBeLessThan(0);
  expect(viewport.x + viewport.width).toBeGreaterThan(6000);
  expect(viewport.width / viewport.height).toBeCloseTo(1000 / 300);
  screen = { width: 700, height: 200 };
  fitTabularAlignment(runtime, net);
  expect(viewport.width / viewport.height).toBeCloseTo(700 / 200);
  expect(viewport.y).toBe(400);
});

test('zoom focal point uses the aligned column and nudged row coordinates', () => {
  const net: NetConfig = {
    left: 20,
    top: 10,
    width: 60,
    height: 40,
    rows: 2,
    cols: 2,
    rowPositions: [50],
    colPositions: [25],
    rowOffsetAdjustments: [{ startRow: 1, offsetPctOfPage: 5 }],
  };
  const cell = getTabularCellBounds(net, { row: 1, col: 1 }, { width: 1000, height: 1000 });
  expect(cell).toEqual({ x: 350, y: 350, width: 450, height: 200 });
  expect(cell && { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 }).toEqual({ x: 575, y: 450 });
});

jest.mock(
  '@/frontend/shared/utility/tabular-row-offset-adjustments',
  () => jest.requireActual('../../../../src/frontend/shared/utility/tabular-row-offset-adjustments'),
  { virtual: true }
);
