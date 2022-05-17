import { Canvas, InternationalString } from '@iiif/presentation-3';

export type CanvasFull = {
  canvas: Canvas & {
    // Some slightly different properties.
    label: InternationalString;
    id: number;
    source_id: string;
  };
  plaintext?: string;
};
