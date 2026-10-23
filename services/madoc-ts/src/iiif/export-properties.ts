import { extraProperties, object } from './properties';
import { JsonObject } from './types';

export function mergeExtraProperties(resource: JsonObject, properties: JsonObject) {
  // Apply only unowned fields; serializers often omit empty/default values from managed fields.
  const extras = extraProperties(properties);
  const contexts = [resource['@context'], extras['@context']].flatMap(context =>
    Array.isArray(context) ? context : context ? [context] : []
  );
  const result = { ...resource, ...extras };
  if (contexts.length)
    result['@context'] = [...new Map(contexts.map(context => [JSON.stringify(context), context])).values()];
  return result;
}

export function remapAnnotationTargets(page: JsonObject, source: string, destination: string): JsonObject {
  function target(value: unknown): unknown {
    if (typeof value === 'string')
      return value === source || value.startsWith(`${source}#`) ? destination + value.slice(source.length) : value;
    if (Array.isArray(value)) return value.map(target);
    if (!object(value)) return value;
    if (value.type === 'SpecificResource') return { ...value, source: target(value.source) };
    return { ...value, ...(typeof value.id === 'string' ? { id: target(value.id) } : {}) };
  }
  return {
    ...page,
    items: Array.isArray(page.items)
      ? page.items.map(annotation =>
          object(annotation) ? { ...annotation, target: target(annotation.target) } : annotation
        )
      : [],
  };
}

export function presentation2Properties(manifest: JsonObject, source: JsonObject): JsonObject {
  const p3Only = new Set(['behavior', 'structures', 'navPlace', 'placeholderCanvas', 'accompanyingCanvas', '@context']);
  function apply(destination: JsonObject, input: JsonObject): JsonObject {
    const extras = Object.fromEntries(Object.entries(extraProperties(input)).filter(([key]) => !p3Only.has(key)));
    const contexts = [input['@context']]
      .flat(2)
      .filter(
        context => context && !(typeof context === 'string' && /^https?:\/\/iiif.io\/api\/presentation\//.test(context))
      );
    const result = { ...destination, ...extras };
    if (Array.isArray(input.behavior) && input.behavior.length) result.viewingHint = input.behavior[0];
    if (contexts.length) result['@context'] = ['http://iiif.io/api/presentation/2/context.json', ...contexts];
    return result;
  }
  const result = apply(manifest, source);
  const sourceCanvases = new Map(
    (Array.isArray(source.items) ? source.items : []).filter(object).map(canvas => [canvas.id, canvas])
  );
  for (const sequence of (Array.isArray(result.sequences) ? result.sequences : [result.sequences]).filter(object)) {
    if (!Array.isArray(sequence.canvases)) continue;
    sequence.canvases = sequence.canvases.map(canvas => {
      if (!object(canvas)) return canvas;
      const input = sourceCanvases.get(canvas['@id']);
      if (!input) return canvas;
      const merged = apply(canvas, input);
      delete merged.annotations;
      if (Array.isArray(input.annotations))
        merged.otherContent = input.annotations.filter(object).map(page => ({
          '@id': page.id,
          '@type': 'sc:AnnotationList',
          label: presentation2Label(page.label),
        }));
      return merged;
    });
  }
  return result;
}

export function restoreNormalizedProperties<T extends object>(normalized: T, source: JsonObject): T {
  // Keep normalized references for structural properties while restoring unknown extensions.
  return { ...extraProperties(source), ...normalized };
}

export function presentation2Label(value: unknown): unknown {
  if (!object(value)) return value;
  return Object.entries(value).flatMap(([language, values]) =>
    (Array.isArray(values) ? values : [values])
      .filter((text): text is string => typeof text === 'string')
      .map(text => (language === 'none' || language === '@none' ? text : { '@value': text, '@language': language }))
  );
}
