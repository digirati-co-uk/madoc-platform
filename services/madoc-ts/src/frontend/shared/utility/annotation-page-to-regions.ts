import { AnnotationPage } from '@hyperion-framework/types';
import parseSelectorTarget from './parse-selector-target';

export function annotationPageToRegions(annotationPage: AnnotationPage) {
  if (!annotationPage || !annotationPage.items || annotationPage.items.length === 0) {
    return [];
  }

  const regions: Array<{
    id: string;
    label: string;
    target: { x: number; y: number; width: number; height: number };
  }> = [];

  for (const annotation of annotationPage.items) {
    if (typeof annotation.target === 'string') {
      const parsed = parseSelectorTarget(annotation.target);
      if (!annotation || !annotation.body || !(annotation.body as any).value) {
        continue;
      }
      if (typeof parsed !== 'string') {
        regions.push({
          id: (annotation as any)['madoc:selectorId'] || annotation.id,
          label: (annotation.body as any).value,
          target: parsed,
        });
      }
    }
  }

  return regions;
}
