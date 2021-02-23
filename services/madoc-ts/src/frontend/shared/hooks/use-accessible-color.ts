// @ts-ignore
import makeColorAccessible from 'make-color-accessible';
import { useMemo } from 'react';

export function useAccessibleColor(background: string, color = '#000') {
  return useMemo(() => {
    return makeColorAccessible(color, { background }) as string;
  }, [background, color]);
}
