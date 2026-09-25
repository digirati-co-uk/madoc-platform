import {
  moveAlignmentEdge,
  nudgeHorizontalAlignment,
} from '../../../../src/frontend/shared/utility/tabular-horizontal-alignment';

test('horizontal alignment translates or scales without moving the opposite edge or crossing image bounds', () => {
  const original = { left: 10, width: 80 };
  expect(nudgeHorizontalAlignment(original, 2)).toEqual({ left: 12, width: 80 });
  expect(nudgeHorizontalAlignment(original, -100)).toEqual({ left: 0, width: 80 });
  expect(nudgeHorizontalAlignment(original, 100)).toEqual({ left: 20, width: 80 });
  const leftMoved = moveAlignmentEdge(original, 'left', 20);
  expect(leftMoved).toEqual({ left: 20, width: 70 });
  expect(leftMoved.left + leftMoved.width).toBe(90);
  expect(moveAlignmentEdge(original, 'right', 95)).toEqual({ left: 10, width: 85 });
  expect(moveAlignmentEdge(original, 'left', 100)).toEqual({ left: 89, width: 1 });
  expect(moveAlignmentEdge(original, 'right', 0)).toEqual({ left: 10, width: 1 });
  expect(moveAlignmentEdge(original, 'right', 200)).toEqual({ left: 10, width: 90 });
  expect(moveAlignmentEdge(original, 'left', Number.NaN)).toBe(original);
  expect(original).toEqual({ left: 10, width: 80 });
});
