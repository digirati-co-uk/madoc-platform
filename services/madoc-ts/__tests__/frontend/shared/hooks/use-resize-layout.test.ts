import { getResizeLayoutWidths } from '../../../../src/frontend/shared/hooks/use-resize-layout';

describe('getResizeLayoutWidths', () => {
  test('calculates and clamps the resizable pane width', () => {
    expect(getResizeLayoutWidths(1000, 0.4, 200, 800)).toEqual({ widthA: '600px', widthB: '400px' });
    expect(getResizeLayoutWidths(1000, 0.1, 200, 800)).toEqual({ widthA: '800px', widthB: '200px' });
    expect(getResizeLayoutWidths(1000, 0.9, 200, 800)).toEqual({ widthA: '200px', widthB: '800px' });
  });
});
