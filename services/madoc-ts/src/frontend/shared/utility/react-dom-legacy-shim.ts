import ReactDOM from 'react-dom';
import { flushSync } from 'react-dom';
import { createRoot, Root } from 'react-dom/client';
import { ReactNode } from 'react';

type LegacyReactDom = typeof ReactDOM & {
  render?: (element: ReactNode, container: Element | DocumentFragment, callback?: () => void) => null;
  unmountComponentAtNode?: (container: Element | DocumentFragment) => boolean;
};

const roots = new WeakMap<Element | DocumentFragment, Root>();
const legacyReactDOM = ReactDOM as LegacyReactDom;

if (typeof window !== 'undefined') {
  if (typeof legacyReactDOM.render !== 'function') {
    legacyReactDOM.render = (element, container, callback) => {
      let root = roots.get(container);

      if (!root) {
        root = createRoot(container);
        roots.set(container, root);
      }

      // Keep behavior close to ReactDOM.render (sync commit) for legacy consumers.
      flushSync(() => {
        root.render(element);
      });
      if (typeof callback === 'function') {
        callback();
      }

      return null;
    };
  }

  if (typeof legacyReactDOM.unmountComponentAtNode !== 'function') {
    legacyReactDOM.unmountComponentAtNode = container => {
      const root = roots.get(container);

      if (root) {
        root.unmount();
        roots.delete(container);
        return true;
      }

      return false;
    };
  }
}
