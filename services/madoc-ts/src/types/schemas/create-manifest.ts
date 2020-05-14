import { ManifestNormalized } from '@hyperion-framework/types';

export type CreateManifest = {
  manifest: Partial<ManifestNormalized>;
  local_source?: string;
  taskId?: string;
};
