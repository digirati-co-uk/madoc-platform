import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { annotationPageToRegions } from '../utility/annotation-page-to-regions';
import { AnnotationPage } from '@iiif/presentation-3';

export function useAnnotationPage(
  pageId?: string,
  embeddedPage?: AnnotationPage,
  canvas?: Parameters<typeof annotationPageToRegions>[1]
) {
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<string | undefined>(undefined);

  const { data: annotationPage, isLoading } = useQuery(
    ['annotation-page', pageId],
    async () => {
      if (!pageId) {
        return null;
      }
      return await fetch(pageId).then(r => r.json());
    },
    { enabled: !!pageId && !embeddedPage && !pageId.startsWith('urn:madoc:annotation-page:') }
  );

  const annotationRegions = useMemo(() => {
    return annotationPageToRegions(embeddedPage || annotationPage, canvas);
  }, [annotationPage, embeddedPage, canvas]);

  return {
    enabled: !!pageId,
    isLoading,
    annotationPage,
    annotationRegions,
    highlightedAnnotation,
    setHighlightedAnnotation,
  };
}
