import { useLayoutEffect } from 'react';

export function useEventHandler(ref: any, name: string, callback: (e: any) => void, deps: any[] = []) {
  useLayoutEffect(() => {
    const current = ref.current;
    current.addEventListener(name, callback);

    return () => {
      current.removeEventListener(name, callback);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, ...deps]);
}
