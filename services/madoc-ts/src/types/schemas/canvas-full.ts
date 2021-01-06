import { InternationalString, MetadataItem } from '@hyperion-framework/types';

export type CanvasFull = {
  canvas: {
    id: number;
    thumbnail?: string;
    label: InternationalString;
    metadata?: Array<MetadataItem>;
    requiredStatement?: MetadataItem;
    summary?: InternationalString;
    height: number;
    width: number;
    source?: any;
    duration?: number;
  };
  plaintext?: string;
};
