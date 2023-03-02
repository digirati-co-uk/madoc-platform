import { Pagination } from './_pagination';
import { InternationalString } from '@iiif/presentation-3';

export type CollectionListResponse = {
  collections: Array<{
    id: number;
    thumbnail: null | string;
    label: InternationalString;
    itemCount?: number;
    items: Array<{
      id: number;
      label: InternationalString;
      thumbnail: null | string;
      canvasCount?: number;
    }>;
  }>;
  pagination: Pagination;
};
