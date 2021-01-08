import { BaseField } from '@capture-models/types';
import { AnnotationW3C } from '@hyperion-framework/types';
import { Annotation } from '@hyperion-framework/presentation-2';

export function captureModelFieldToW3CAnnotation(
  id: string,
  value: string,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): AnnotationW3C & { id: string; type: string; ['madoc:id']: number } {
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
      value: value,
    },
    'madoc:id': madocCanvasId,
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
): Annotation & { ['madoc:id']: number } {
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
      chars: value,
    },
    'madoc:id': madocCanvasId,
    on: selectorState
      ? `${
          options.canvas
        }#xywh=${~~selectorState.x},${~~selectorState.y},${~~selectorState.width},${~~selectorState.height}`
      : options.canvas,
  };
}
