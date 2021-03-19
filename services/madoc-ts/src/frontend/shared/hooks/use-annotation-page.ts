import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import parseSelectorTarget from '../utility/parse-selector-target';

export function useAnnotationPage(pageId?: string) {
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<string | undefined>(undefined);

  const { data: annotationPage, isLoading } = useQuery(
    ['annotation-page', pageId],
    async () => {
      if (!pageId) {
        return null;
      }
      return await fetch(pageId).then(r => r.json());
    },
    { enabled: !!pageId }
  );

  const annotationRegions = useMemo(() => {
    if (!annotationPage || !annotationPage.items || annotationPage.items.length === 0) {
      return [];
    }

    const regions: Array<{
      id: string;
      label: string;
      target: { x: number; y: number; width: number; height: number };
    }> = [];

    for (const annotation of annotationPage.items) {
      const parsed = parseSelectorTarget(annotation.target);
      if (!annotation || !annotation.body || !annotation.body.value) {
        continue;
      }
      if (typeof parsed !== 'string') {
        regions.push({
          id: annotation.id,
          label: annotation.body.value,
          target: parsed,
        });
      }
    }

    return regions;
  }, [annotationPage]);

  return {
    enabled: !!pageId,
    isLoading,
    annotationPage,
    annotationRegions,
    highlightedAnnotation,
    setHighlightedAnnotation,
  };
}
