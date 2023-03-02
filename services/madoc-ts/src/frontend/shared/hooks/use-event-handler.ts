import { useLayoutEffect } from 'react';
import { useBrowserLayoutEffect } from './use-browser-layout-effect';

export function useEventHandler(ref: any, name: string, callback: (e: any) => void, deps: any[] = []) {
  useBrowserLayoutEffect(() => {
    const current = ref.current;
    if (current) {
      current.addEventListener(name, callback);

      return () => {
        current.removeEventListener(name, callback);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, ...deps]);
}
