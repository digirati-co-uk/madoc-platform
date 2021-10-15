import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

function _ScrollTop({ history }: any) {
  useEffect(() => {
    const listener = history.listen(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
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
