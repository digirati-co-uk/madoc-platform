import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

function _ScrollTop({ history }: any) {
  useEffect(() => {
    const listener = history.listen(() => {
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
    });
    return () => {
      listener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export const ScrollTop = withRouter(_ScrollTop);
