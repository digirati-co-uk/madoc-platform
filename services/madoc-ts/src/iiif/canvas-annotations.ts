import { JsonObject } from './types';
import { identifier, object } from './properties';

export function targetsCanvas(target: unknown, canvasSource: string): boolean {
  if (Array.isArray(target)) return target.some(value => targetsCanvas(value, canvasSource));
  if (object(target) && target.type === 'SpecificResource') return targetsCanvas(target.source, canvasSource);
  return identifier(target)?.split('#')[0] === canvasSource;
}

// A viewer projection: keep fetched text separate in storage and leave the source snapshot intact.
export function canvasAnnotationPage(
  document: JsonObject,
  canvasSource: string,
  textBodies: Record<string, string> = {}
): JsonObject {
  return {
    ...document,
    items: (Array.isArray(document.items) ? document.items : [])
      .filter(object)
      .filter(annotation => targetsCanvas(annotation.target, canvasSource))
      .map(annotation => {
        function bodyWithText(body: unknown): unknown {
          if (!object(body) || typeof body.value === 'string') return body;
          const value = textBodies[identifier(body) || ''];
          return value !== undefined ? { ...body, value } : body;
        }
        return {
          ...annotation,
          body: Array.isArray(annotation.body) ? annotation.body.map(bodyWithText) : bodyWithText(annotation.body),
        };
      }),
  };
}
