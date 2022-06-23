import { useLocation } from 'react-router-dom';
import { useBrowserLayoutEffect } from '../hooks/use-browser-layout-effect';

export function ScrollTop() {
  const location = useLocation();

  useBrowserLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        window.scrollTo(0, 0);
      } else {
        const $el = document.getElementById(hash);
        if ($el) {
          $el.scrollIntoView({ block: 'start' });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return null;
}
