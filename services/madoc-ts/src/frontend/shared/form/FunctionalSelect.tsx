import React, { useEffect, useState } from 'react';

export type SelectRef = {
  setValue?: (value: unknown) => void;
  focus?: () => void;
  blur?: () => void;
  clearValue?: () => void;
  toggleMenu?: (open?: boolean) => void;
};

type SelectComponent = React.ComponentType<Record<string, unknown>>;

let selectLoader: Promise<SelectComponent> | undefined;
const SELECT_MODULE = 'react-functional-select';
const loadModule = new Function('modulePath', 'return import(modulePath);') as (
  modulePath: string
) => Promise<{ Select: SelectComponent }>;

function loadSelectComponent() {
  if (typeof window === 'undefined') {
    return Promise.resolve(() => null);
  }

  if (!selectLoader) {
    // Keep this as a runtime-only browser import and avoid static server bundling.
    selectLoader = loadModule(SELECT_MODULE).then(mod => mod.Select as SelectComponent);
  }
  return selectLoader;
}

export const Select = React.forwardRef<SelectRef, Record<string, unknown>>(function SafeFunctionalSelect(props, ref) {
  const [Component, setComponent] = useState<SelectComponent | null>(null);

  useEffect(() => {
    let mounted = true;
    loadSelectComponent().then(Loaded => {
      if (mounted) {
        setComponent(() => Loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Component) {
    return null;
  }

  return <Component {...props} ref={ref as never} />;
});
