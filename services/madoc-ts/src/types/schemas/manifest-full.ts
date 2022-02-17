import { InternationalString, MetadataItem, ViewingDirection } from '@hyperion-framework/types';
import { Pagination } from './_pagination';

export type ManifestFull = {
  manifest: {
    id: number;
    thumbnail: null | string;
    label: InternationalString;
    metadata?: Array<MetadataItem>;
    requiredStatement?: MetadataItem;
    summary?: InternationalString;
    published?: boolean;
    viewingDirection: ViewingDirection;
    source?: string;
    items: Array<{
      id: number;
      label: InternationalString;
      thumbnail: null | string;
    }>;
  };
  subjects?: Array<{
    subject: string;
    status: number;
  }>;
  pagination: Pagination;
};
