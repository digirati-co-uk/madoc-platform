import { AnnotationPage } from '@iiif/presentation-3';
import { identifier, object } from '../../../iiif/properties';
import { targetsCanvas } from '../../../iiif/canvas-annotations';
import parseSelectorTarget from './parse-selector-target';

interface CanvasTarget {
  source_id: string;
  width?: number;
  height?: number;
}

function bodyLabel(value: unknown): string {
  if (Array.isArray(value)) return value.map(bodyLabel).filter(Boolean).join('\n');
  if (!object(value)) return typeof value === 'string' ? value : '';
  if (typeof value.value === 'string') return value.value;
  if (object(value.label))
    return Object.values(value.label)
      .flat()
      .filter(v => typeof v === 'string')
      .join(' ');
  return identifier(value) || '';
}

function targetRegion(target: unknown, canvas?: CanvasTarget): ReturnType<typeof parseSelectorTarget> | undefined {
  if (Array.isArray(target)) {
    const regions = target.map(value => targetRegion(value, canvas));
    return (
      regions.find(value => value && typeof value !== 'string') || regions.find(value => typeof value === 'string')
    );
  }
  if (canvas && !targetsCanvas(target, canvas.source_id)) return;
  if (object(target) && target.type === 'SpecificResource') {
    const selector = target.selector;
    if (object(selector) && selector.type === 'FragmentSelector' && typeof selector.value === 'string') {
      return parseSelectorTarget(`#${selector.value}`);
    }
    if (selector) return;
    return targetRegion(target.source, canvas);
  }
  const id = identifier(target);
  return id ? parseSelectorTarget(id) : undefined;
}

export function annotationPageToRegions(annotationPage?: AnnotationPage | null, canvas?: CanvasTarget) {
  const regions: Array<{
    id: string;
    label: string;
    target: { x: number; y: number; width: number; height: number };
  }> = [];

  for (const annotation of annotationPage?.items || []) {
    const parsed = targetRegion(annotation.target, canvas);
    let target: { x: number; y: number; width: number; height: number; unit?: string } | undefined =
      parsed && typeof parsed !== 'string' ? parsed : undefined;
    // Whole-canvas annotations still need a selectable entry in the viewer.
    if (!target && parsed === canvas?.source_id && canvas?.width && canvas.height) {
      target = { x: 0, y: 0, width: canvas.width, height: canvas.height };
    }
    if (!target) continue;
    if (target.unit === 'percent') {
      if (!canvas?.width || !canvas.height) continue;
      target = {
        ...target,
        x: (target.x * canvas.width) / 100,
        y: (target.y * canvas.height) / 100,
        width: (target.width * canvas.width) / 100,
        height: (target.height * canvas.height) / 100,
      };
    }
    const selectorId = (annotation as unknown as Record<string, unknown>)['madoc:selectorId'];
    regions.push({
      id: typeof selectorId === 'string' ? selectorId : annotation.id,
      label: bodyLabel(annotation.body) || bodyLabel({ label: annotation.label }) || 'Annotation',
      target,
    });
  }
  return regions;
}
