import React, { useLayoutEffect, useState } from 'react';
import { init, Viewer } from 'universalviewer';
import { useBrowserLayoutEffect } from '../frontend/shared/hooks/use-browser-layout-effect';

export function useEvent(viewer: Viewer | undefined, name: string, cb: (...args: any[]) => void) {
  useBrowserLayoutEffect(() => {
    if (viewer) {
      return viewer.subscribe(name, cb);
    }
  }, [viewer]);
}

export function useUniversalViewer(
  ref: React.RefObject<HTMLDivElement>,
  options: any,
  resizeIfTheseChange: any[] = []
) {
  const [uv, setUv] = useState<Viewer>();

  useBrowserLayoutEffect(() => {
    if (uv && ref.current) {
      if (ref.current.firstChild) {
        (ref.current.firstChild as HTMLDivElement).style.width = ref.current.offsetWidth + 'px';
        (ref.current.firstChild as HTMLDivElement).style.height = ref.current.offsetHeight + 'px';
        uv.resize();
      }
    }
  }, resizeIfTheseChange);

  useBrowserLayoutEffect(() => {
    if (ref.current) {
      const currentUv = init(ref.current, options);
      setUv(currentUv);

      return () => {
        currentUv.dispose();
      };
    }
  }, [ref]);

  return uv;
}
