import React, { useMemo } from 'react';
import { useData } from '../hooks/use-data';
import { ErrorBoundary } from '../utility/error-boundary';

export function createPluginWrapper(Component: any, name: string) {
  const Wrapper = function PluginWrapper() {
    const loader = useMemo(() => {
      return {
        useData: () => useData(Wrapper),
      };
    }, []);

    return (
      <ErrorBoundary>
        <Component loader={loader} />
      </ErrorBoundary>
    );
  };

  Wrapper.getData = Component.getData;
  Wrapper.getKey = Component.getKey;
  Wrapper.displayName = `plugin(${name})`;

  return Wrapper;
}

export function createPluginWrapperFromElement(element: any, name: string) {
  const Component = element.type;
  const Wrapper = function PluginWrapper() {
    return <ErrorBoundary>{element}</ErrorBoundary>;
  };

  Wrapper.getData = Component.getData;
  Wrapper.getKey = Component.getKey;
  Wrapper.displayName = `plugin(${name})`;

  return <Wrapper />;
}
