import { Canvas, InternationalString } from '@hyperion-framework/types';

export type CanvasFull = {
  canvas: Canvas & {
    // Some slightly different properties.
    label: InternationalString;
    id: number;
    source_id: string;
  };
  plaintext?: string;
};
