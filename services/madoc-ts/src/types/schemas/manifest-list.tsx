import { InternationalString } from '@hyperion-framework/types';
import { Pagination } from './_pagination';

export type ManifestListResponse = {
  manifests: Array<{
    id: number;
    thumbnail: null | string;
    label: InternationalString;
    canvasCount?: number;
  }>;
  pagination: Pagination;
};
