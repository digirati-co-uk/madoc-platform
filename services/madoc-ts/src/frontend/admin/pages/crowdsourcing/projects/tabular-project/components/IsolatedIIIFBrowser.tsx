import React, { useEffect, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { VaultProvider } from 'react-iiif-vault';
import type { IIIFBrowserProps } from 'iiif-browser';

const IIIF_BROWSER_OMNIBAR_LABEL = 'Search commands or enter a URL to a IIIF Manifest or Collection';

function isIiifOmnibarInput(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && target.getAttribute('aria-label') === IIIF_BROWSER_OMNIBAR_LABEL;
}

export function IsolatedIIIFBrowser(props: IIIFBrowserProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const keepCaretAtEnd = (event: Event) => {
      if (!isIiifOmnibarInput(event.target)) {
        return;
      }

      const input = event.target;
      queueMicrotask(() => {
        const hasSelection = input.selectionStart !== input.selectionEnd;
        const fullValueSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;

        if (document.activeElement === input && hasSelection && fullValueSelected) {
          const caretPosition = input.value.length;
          input.setSelectionRange(caretPosition, caretPosition);
        }
      });
    };

    host.addEventListener('focusin', keepCaretAtEnd, true);

    return () => {
      host.removeEventListener('focusin', keepCaretAtEnd, true);
    };
  }, []);

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
