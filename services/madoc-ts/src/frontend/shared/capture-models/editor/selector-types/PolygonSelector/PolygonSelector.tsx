import { BaseSelector } from '../../../types/selector-types';

export interface PolygonSelectorProps extends BaseSelector {
  id: string;
  type: 'polygon-selector';
  hidden?: boolean;
  state: null | {
    points: Array<{ x: number; y: number }>;
    orientation?: number;
    readingOrientation?: number;
    readingDirection?: string;
    type: string;
  };
}
