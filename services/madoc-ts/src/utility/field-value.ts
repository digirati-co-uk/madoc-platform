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

export function urlMedia(label: string, imageUrl: string): undefined | Omit<VirtualMedia, 'property_id'> {
  const hash = crypto
    .randomBytes(Math.ceil(40 / 2))
    .toString('hex')
    .slice(0, 40);

  const fileHash = `virtual/${hash}`;

  return {
    type: 'virtual',
    label,
    url: imageUrl,
    media: {
      storage_id: fileHash,
      size: 0,
      renderer: 'file',
      ingester: 'upload',
      has_thumbnails: 1,
      extension: 'jpg',
      source: imageUrl,
      media_type: 'image/jpeg',
      has_original: 1,
    },
  };
}

export function uploadedFile(
  label: string,
  filepath: string,
  media_type: string,
  source: string,
  data: Buffer
): Omit<MediaValue, 'property_id'> {
  const { dir, ext, name } = path.parse(filepath);
  const storage_id = `${dir}/${name}`;
  const extension = ext.slice(1);

  return {
    type: 'media',
    label,
    extension,
    filename: name,
    folder: dir,
    data,
    media: {
      has_original: 1,
      has_thumbnails: 0,
      ingester: 'upload',
      renderer: 'file',
      size: data.length,
      source,
      media_type,
      storage_id,
      extension,
    },
  };
}

export function jsonMedia(label: string, filepath: string, source: string, data: Buffer) {
  return uploadedFile(label, filepath, 'application/json', source, data);
}

export function fromInternationalString(intField?: InternationalString | null): Array<Partial<Value>> {
  if (!intField) {
    return [];
  }
  const languages = Object.keys(intField);
  const literalValues = [];
  for (const language of languages) {
    const languageStrings = intField[language];
    if (languageStrings && language !== '@none') {
      literalValues.push(literal(languageStrings.join(''), language));
    } else if (languageStrings) {
      literalValues.push(literal(languageStrings.join('')));
    }
  }
  return literalValues;
}
