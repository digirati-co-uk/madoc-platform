import { upgrade } from '@iiif/parser/upgrader';
import { JsonObject } from './types';

export function object(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function identifier(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (!object(value)) return;
  const id = value.id || value['@id'];
  return typeof id === 'string' ? id : undefined;
}

// These fields have dedicated storage and must never be restored from an old snapshot.
const managed = new Set([
  'id',
  '@id',
  'type',
  '@type',
  'label',
  'summary',
  'metadata',
  'requiredStatement',
  'rights',
  'viewingDirection',
  'thumbnail',
  'height',
  'width',
  'duration',
  'items',
  'annotations',
  'homepage',
  'partOf',
  'rendering',
  'seeAlso',
  'service',
  'services',
  'start',
  'provider',
  'logo',
  'supplementary',
  'madoc_id',
  '__proto__',
  'constructor',
  'prototype',
]);

export function extraProperties(resource: JsonObject): JsonObject {
  return Object.fromEntries(Object.entries(resource).filter(([key]) => !managed.has(key)));
}

export function presentation3(resource: JsonObject): JsonObject {
  // Avoid a Vault round trip here: extensions and embedded documents must survive intact.
  if (!resource['@type']) return resource;
  const upgraded = upgrade(structuredClone(resource)) as unknown as JsonObject;
  const legacy = new Set([
    ...managed,
    '@context',
    'sequences',
    'canvases',
    'images',
    'otherContent',
    'description',
    'attribution',
    'license',
    'viewingHint',
    'within',
    'related',
    'members',
  ]);
  const extensions = (input: JsonObject) =>
    Object.fromEntries(Object.entries(input).filter(([key]) => !legacy.has(key)));
  const originals = new Map<string | undefined, JsonObject>();
  for (const sequence of Array.isArray(resource.sequences) ? resource.sequences : []) {
    if (!object(sequence)) continue;
    for (const canvas of Array.isArray(sequence.canvases) ? sequence.canvases : []) {
      if (object(canvas)) originals.set(identifier(canvas), canvas);
    }
  }
  const result = { ...extensions(resource), ...upgraded };
  if (Array.isArray(result.items))
    result.items = result.items.map(canvas => {
      if (!object(canvas)) return canvas;
      const original = originals.get(identifier(canvas));
      return original ? { ...extensions(original), ...canvas } : canvas;
    });
  return result;
}

export function importedPages(resource: JsonObject): JsonObject[] {
  const annotations = resource.annotations;
  if (!Array.isArray(annotations)) return [];
  return annotations
    .map(page => (typeof page === 'string' ? { id: page, type: 'AnnotationPage' } : page))
    .filter(object);
}
