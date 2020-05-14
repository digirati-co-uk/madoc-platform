import { InternationalString, MetadataItem } from '@hyperion-framework/types';
import { Pagination } from './_pagination';

export type CollectionFull = {
  collection: {
    id: number;
    thumbnail: null | string;
    label: InternationalString;
    metadata?: Array<MetadataItem>;
    requiredStatement?: MetadataItem;
    summary?: InternationalString;
    items: Array<{
      id: number;
      type: string;
      label: InternationalString;
      thumbnail: null | string;
      canvasCount?: number;
    }>;
  };
  pagination: Pagination;
};
