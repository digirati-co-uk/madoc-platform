import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { annotationPageToRegions } from '../utility/annotation-page-to-regions';
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
    return annotationPageToRegions(annotationPage);
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
