import { Canvas, Collection, InternationalString, Manifest } from '@iiif/presentation-3';

export type EnrichmentIndexPayload = {
  madoc_id: string;
  label: InternationalString;
  type: 'manifest' | 'canvas' | 'collection';
  madoc_url: string;
  thumbnail: string;
  iiif_json: Manifest | Canvas | Collection;
  contexts: string[];
};

export interface DjangoPagination<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
