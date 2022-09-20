import { InternationalString } from '@iiif/presentation-3';
import { MetadataDefinition } from '../types/schemas/metadata-definition';

export type MetadataField = {
  resource_id: number;
  resource_type?: string;
  key: string;
  value: string;
  language: string;
  source: string;
  thumbnail?: string;
  created_at?: Date;
  total?: number;
  published?: boolean;
};

export const setValueDotNotation = (property: any, key: string, setValue: (prop: any) => void) => {
  // eslint-disable-next-line eqeqeq
  const properties = key ? key.split('.').map((r: string | number) => (r == Number(r) ? Number(r) : r)) : [];
  for (let i = 0; i < properties.length; i++) {
    if (!property[properties[i]]) {
      if (typeof properties[i + 1] !== 'undefined') {
        if (typeof properties[i + 1] === 'number') {
          property[properties[i]] = [];
        } else {
          property[properties[i]] = {};
        }
      } else {
        property[properties[i]] = {};
      }
    }
    property = property[properties[i]];
  }

  setValue(property);
};

export function getValueDotNotation<T = any>(property: any, key: string): T {
  // eslint-disable-next-line eqeqeq
  const properties = key ? key.split('.').map((r: string | number) => (r == Number(r) ? Number(r) : r)) : [];
  for (let i = 0; i < properties.length; i++) {
    if (!property[properties[i]]) {
      return undefined as any;
    }
    property = property[properties[i]];
  }

  return property as T;
}

export const createMetadataReducer = <T, M extends MetadataField = MetadataField>(createRow: (field: M) => T) => (
  acc: any,
  next: M
) => {
  if (next.key === null) {
    // We always need a label.
    next.key = 'label';
    next.language = 'none';
    next.value = 'Untitled';
  }

  if (!acc[next.resource_id]) {
    acc[next.resource_id] = createRow(next);
  }

  let property = acc[next.resource_id];

  // eslint-disable-next-line eqeqeq
  const properties = next.key ? next.key.split('.').map((r: string | number) => (r == Number(r) ? Number(r) : r)) : [];
  for (let i = 0; i < properties.length; i++) {
    if (!property[properties[i]]) {
      if (typeof properties[i + 1] !== 'undefined') {
        if (typeof properties[i + 1] === 'number') {
          property[properties[i]] = [];
        } else {
          property[properties[i]] = {};
        }
      } else {
        property[properties[i]] = {};
      }
    }
    property = property[properties[i]];
  }

  if (!property[next.language]) {
    property[next.language] = [];
  }

  property[next.language].push(next.value);

  return acc;
};

export const metadataReducer = createMetadataReducer(next => ({
  id: next.resource_id,
  type: next.resource_type,
  created: next.created_at,
  thumbnail: next.thumbnail,
  published: next.published,
}));

export function mapMetadata<
  T extends any = {
    [key: string]: InternationalString | Array<{ label: InternationalString; value: InternationalString }>;
  },
  M extends MetadataField = MetadataField,
  Base extends any = any
>(fields: readonly M[], createRow?: (field: M) => Base): (Base & T)[] {
  const order: number[] = [];
  for (const fid of fields) {
    if (order.indexOf(fid.resource_id) === -1) {
      order.push(fid.resource_id);
    }
  }

  const reducer = createRow ? createMetadataReducer(createRow) : metadataReducer;
  const returnList: T[] = [];
  const fieldMap = fields.reduce<any>(reducer, {});
  for (const id of order) {
    returnList.push(fieldMap[id]);
  }
  return returnList as any;
}

export function parseMetadataListToValueMap(fields: Array<MetadataDefinition & { id: number }>) {
  const keysIndex: Record<string, number> = {};
  const valueIndex: Record<number, Array<MetadataDefinition & { id: number }>> = {};
  let metadataCursor = 0;

  for (const field of fields) {
    if (field.key.startsWith('metadata.') && field.key.endsWith('.label')) {
      const [, index] = field.key.split('.');
      const keyToStore = field.value.toLowerCase();
      keysIndex[keyToStore] = Number(index);

      metadataCursor = Math.max(metadataCursor, Number(index));
    }
    if (field.key.startsWith('metadata.') && field.key.endsWith('.value')) {
      const [, index] = field.key.split('.');
      const numberIndex = Number(index);
      valueIndex[numberIndex] = valueIndex[numberIndex] ? valueIndex[numberIndex] : [];
      valueIndex[numberIndex].push(field);
      metadataCursor = Math.max(metadataCursor, numberIndex);
    }
  }

  metadataCursor++;

  return {
    metadataCursor,
    keysIndex,
    valueIndex,
  };
}
