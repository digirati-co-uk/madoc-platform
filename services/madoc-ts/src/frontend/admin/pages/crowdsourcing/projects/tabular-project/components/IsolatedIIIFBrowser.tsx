import React, { useEffect, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { VaultProvider } from 'react-iiif-vault';
import type { IIIFBrowserProps } from 'iiif-browser';

export function IsolatedIIIFBrowser(props: IIIFBrowserProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!hostRef.current) {
        return;
      }

      const [{ createRoot }, browserModule] = await Promise.all([import('react-dom/client'), import('iiif-browser')]);
      if (cancelled || !hostRef.current) {
        return;
      }

      if (!rootRef.current) {
        rootRef.current = createRoot(hostRef.current);
      }

      rootRef.current.render(
        <VaultProvider>
          <browserModule.IIIFBrowser {...props} />
        </VaultProvider>
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [props]);

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return <div ref={hostRef} />;
}
