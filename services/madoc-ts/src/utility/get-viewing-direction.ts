import { ViewingDirection } from '@iiif/presentation-3';

export function getViewingDirection(viewingDirection: string | number): ViewingDirection {
  let viewDir: ViewingDirection = 'left-to-right';
  switch (viewingDirection) {
    case 'left-to-right':
    case 0:
      viewDir = 'left-to-right';
      break;
    case 'right-to-left':
    case 1:
      viewDir = 'right-to-left';
      break;
    case 'top-to-bottom':
    case 2:
      viewDir = 'top-to-bottom';
      break;
    case 'bottom-to-top':
    case 3:
      viewDir = 'bottom-to-top';
      break;
  }
  return viewDir;
}
