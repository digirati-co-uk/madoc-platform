import { CanvasNormalized } from '@hyperion-framework/types';

export type CreateCanvas = {
  canvas: Partial<CanvasNormalized>;

  thumbnail?: string;

  local_source?: string;
};
