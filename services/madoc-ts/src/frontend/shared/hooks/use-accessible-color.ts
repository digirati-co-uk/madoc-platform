import { useMemo } from 'react';
import { makeColorAccessible } from '../utility/make-color-accessible';

export function useAccessibleColor(background: string) {
  return useMemo(() => {
    return makeColorAccessible(background);
  }, [background]);
}
