import { InternationalString, MetadataItem } from '@iiif/presentation-3';
import { Pagination } from './_pagination';

export type CollectionFull = {
  collection: {
    id: number;
    thumbnail: null | string;
    label: InternationalString;
    metadata?: Array<MetadataItem>;
    requiredStatement?: MetadataItem;
    summary?: InternationalString;
    source?: string;
    published?: boolean;
    items: Array<{
      id: number;
      type: string;
      label: InternationalString;
      thumbnail: null | string;
      canvasCount?: number;
      firstCanvasId?: number;
    }>;
    placeholder_image?: string;
  };
  subjects?: Array<{
    subject: string;
    status: number;
  }>;
  pagination: Pagination;
};
