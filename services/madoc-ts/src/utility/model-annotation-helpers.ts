import { AnnotationW3C } from '@iiif/presentation-3';
import { Annotation } from '@iiif/presentation-2';
import { BaseField } from '../frontend/shared/capture-models/types/field-types';

export function captureModelFieldToW3CAnnotation(
  id: string,
  value: any,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): AnnotationW3C & { id: string; type: string; ['madoc:id']: number; ['madoc:selectorId']: string | undefined } {
  const madocCanvasId = options.madocCanvasId;
  const gatewayHost = options.gatewayHost;
  const path = options.path;

  let target: AnnotationW3C['target'] = options.canvas;

  if (selector && selector.type === 'box-selector') {
    target = `${options.canvas}${boxSelectorToXYWH(selector)}`;
  }

  if (selector && selector.type === 'polygon-selector') {
    target = polygonSelectorToW3CTarget(options.canvas, selector);
  }

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
      target: target,
    };
  }

  return {
    id: `${gatewayHost}${path}/${id}`,
    type: 'Annotation',
    motivation: 'commenting',
    body: {
      type: 'TextualBody',
      value: typeof value === 'string' ? value : '',
    },
    'madoc:id': madocCanvasId,
    'madoc:selectorId': selector?.id,
    target: target,
  };
}

export function polygonSelectorToW3CTarget(canvas: string, selector: BaseField['selector']): AnnotationW3C['target'] {
  if (!selector) {
    return canvas;
  }

  const selectorState = selector?.state;
  const points: Array<[number, number]> = selectorState?.shape?.points || [];
  if (!points.length) {
    return canvas;
  }

  return {
    type: 'SpecificResource',
    source: canvas,
    selector: {
      type: 'SvgSelector',
      value: `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><path d='M${points
        .map(p => p.join(','))
        .join(' ')}' /></g></svg>`,
    },
  };
}

export function captureModelFieldToOpenAnnotation(
  id: string,
  value: any,
  selector: BaseField['selector'],
  options: { madocCanvasId: number; canvas: string; gatewayHost: string; path: string }
): Annotation & { ['madoc:id']: number; ['madoc:selectorId']: string | undefined } {
  const madocCanvasId = options.madocCanvasId;
  const gatewayHost = options.gatewayHost;
  const path = options.path;

  let onField = options.canvas;

  if (selector && selector.type === 'box-selector') {
    onField = `${options.canvas}${boxSelectorToXYWH(selector)}`;
  }
  if (selector && selector.type === 'polygon-selector') {
    onField = `${options.canvas}${polygonSelectorToXYWH(selector)}`;
  }

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
    on: onField,
  };
}

export function boxSelectorToXYWH(selector: BaseField['selector']) {
  const selectorState = selector?.state;
  if (!selectorState) {
    return '';
  }
  return `#xywh=${~~selectorState.x},${~~selectorState.y},${~~selectorState.width},${~~selectorState.height}`;
}

export function polygonSelectorToXYWH(selector: BaseField['selector']) {
  const selectorState = selector?.state;
  const points: Array<[number, number]> = selectorState?.shape?.points || [];
  if (!points.length) {
    return '';
  }

  const x1 = Math.min(...points.map(p => p[0]));
  const y1 = Math.min(...points.map(p => p[1]));
  const x2 = Math.max(...points.map(p => p[0]));
  const y2 = Math.max(...points.map(p => p[1]));
  const width = x2 - x1;
  const height = y2 - y1;

  return `#xywh=${~~x1},${~~y1},${~~width},${~~height}`;
}
export function polygonSelectorToSvg(selector: BaseField['selector']) {
  const selectorState = selector?.state;
  const points: Array<[number, number]> = selectorState?.shape?.points || [];
  if (!points.length) {
    return '';
  }

  const x1 = Math.min(...points.map(p => p[0]));
  const y1 = Math.min(...points.map(p => p[1]));
  const x2 = Math.max(...points.map(p => p[0]));
  const y2 = Math.max(...points.map(p => p[1]));
  const width = x2 - x1;
  const height = y2 - y1;

  return `#xywh=${~~x1},${~~y1},${~~width},${~~height}`;
}
