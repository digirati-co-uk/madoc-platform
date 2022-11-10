import { AnnotationW3C } from '@iiif/presentation-3';
import { Annotation } from '@iiif/presentation-2';
import { BaseField } from '../frontend/shared/capture-models/types/field-types';

export function captureModelFieldToW3CAnnotation(
  id: string,
  value: string,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): AnnotationW3C & { id: string; type: string; ['madoc:id']: number; ['madoc:selectorId']: string | undefined } {
  const selectorState = selector?.state;
  const madocCanvasId = options.madocCanvasId;
  const gatewayHost = options.gatewayHost;
  const path = options.path;

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
  value: string,
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
