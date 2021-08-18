import { Value } from '../types/omeka/Value';
import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import { Media } from '../types/omeka/Media';
import crypto from 'crypto';
import path from 'path';

export type MediaValue = {
  type: 'media';
  label: string;
  folder: string;
  filename: string;
  extension: string;
  data: Buffer;
  media: Omit<Media, 'id' | 'item_id' | 'position'>;
  property_id: number;
};

export type VirtualMedia = {
  type: 'virtual';
  label: string;
  url: string;
  property_id: number;
  media: Omit<Media, 'id' | 'item_id' | 'position'>;
};

export function entity(id: number, type: 'resource' | 'resource:item' = 'resource'): Partial<Value> {
  return {
    type: type,
    value_resource_id: id,
  };
}
export function literal(value: string, language?: string): Partial<Value> {
  return {
    type: 'literal',
    value,
    lang: language,
  };
}
export function url(label: string, resourceUrl: string, language?: string): Partial<Value> {
  return {
    type: 'uri',
    uri: resourceUrl,
    lang: language,
    value: label,
  };
}
