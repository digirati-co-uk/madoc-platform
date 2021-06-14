import { useEffect, useRef } from 'react';
import { useSelectorHelper } from '@capture-models/editor';

export function useHighlightSelector(id?: string) {
  const helper = useSelectorHelper();
  const unsubscribe = useRef<any>(null);

  useEffect(() => {
    if (id) {
      unsubscribe.current = id;
      helper.highlight(id);
    }

    return () => {
      if (unsubscribe.current) {
        helper.clearHighlight(unsubscribe.current);
        unsubscribe.current = null;
      }
    };
  }, [helper, id]);
}
