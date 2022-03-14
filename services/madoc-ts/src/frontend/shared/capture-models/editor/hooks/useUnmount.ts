import { useCallback, useEffect, useRef } from 'react';

export function useUnmount(callback: () => void, deps: any[] = []) {
  const unmount = useRef<Function>();

  unmount.current = useCallback(callback, deps);

  useEffect(() => {
    return () => {
      if (unmount.current) {
        unmount.current();
      }
    };
  }, []);
}
