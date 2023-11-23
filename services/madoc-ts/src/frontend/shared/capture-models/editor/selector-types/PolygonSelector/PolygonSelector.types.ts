import { InputShape } from 'polygon-editor';

export interface ShapeToolProps {
  image: { width: number; height: number };
  shape?: InputShape;
  updateShape: (shape: InputShape) => void;
  deselect?: () => void;
}
