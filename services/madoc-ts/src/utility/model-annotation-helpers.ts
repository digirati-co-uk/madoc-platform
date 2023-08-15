import { AnnotationW3C } from '@iiif/ presentation-3';
import { Annotation } from '@iiif/presentation-2';
import { BaseField } from '../frontend/shared/capture-models/types/field-types';

export function captureModelFieldToW3CAnnotation(
  id: string,
  value: any,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): AnnotationW3C & { id: string; type: string; ['madoc:id']: number; ['madoc:selectorId']: string | undefined } {
  const selectorState = selector?.state;
  const madocCanvasId = options.madocCanvasId;
  const gatewayHost = options.gatewayHost;
  const path = options.path;

  if (value && value.uri) {
    return {
      id: `${gatewayHost}${path}/${id}`,
      type: 'Annotation',
      motivation: 'tagging',
      body: [
        {
          type: 'SpecificResource',
          source: value.uri,
          id: value.resource_class,
        },
        {
          type: 'TextualBody',
          value: value.label,
          format: 'text/plain',
        },
      ],
      'madoc:id': madocCanvasId,
      'madoc:selectorId': selector?.id,
      target: selectorState
        ? `${
            options.canvas
          }#xywh=${~~selectorState.x},${~~selectorState.y},${~~selectorState.width},${~~selectorState.height}`
        : options.canvas,
    };
  }

  return {
    id: `${gatewayHost}${path}/${id}`,
    type: 'Annotation',
    motivation: 'painting',
    body: {
      type: 'TextualBody',
      value: typeof value === 'string' ? value : '',
    },
    'madoc:id': madocCanvasId,
    'madoc:selectorId': selector?.id,
    target: selectorState
      ? `${
          options.canvas
        }#xywh=${~~selectorState.x},${~~selectorState.y},${~~selectorState.width},${~~selectorState.height}`
      : options.canvas,
  };
}

export function captureModelFieldToOpenAnnotation(
  id: string,
  value: any,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): Annotation & { ['madoc:id']: number; ['madoc:selectorId']: string | undefined } {
  const selectorState = selector?.state;
  const madocCanvasId = options.madocCanvasId;
  const gatewayHost = options.gatewayHost;
  const path = options.path;

  return {
    '@id': `${gatewayHost}${path}/${id}`,
    '@type': 'oa:Annotation',
    motivation: 'sc:painting',
    resource: {
      '@type': 'cnt:ContentAsText',
      chars: typeof value === 'string' ? value : '',
    },
    'madoc:id': madocCanvasId,
    'madoc:selectorId': selector?.id,
    on: selectorState
      ? `${
          options.canvas
        }#xywh=${~~selectorState.x},${~~selectorState.y},${~~selectorState.width},${~~selectorState.height}`
      : options.canvas,
  };
}
