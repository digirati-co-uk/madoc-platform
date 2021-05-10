import React, { useMemo } from 'react';
import { useCollectionList } from '../../site/hooks/use-collection-list';
import { useData } from '../hooks/use-data';
import { ErrorBoundary } from '../utility/error-boundary';
import { hooks } from './hooks';

export function createPluginWrapper(Component: any) {
  const Wrapper = function PluginWrapper() {
    const loader = useMemo(() => {
      return {
        useData: () => useData(Wrapper),
        useCollectionList,
      };
    }, []);

    return (
      <ErrorBoundary>
        <Component hooks={hooks} loader={loader} />
      </ErrorBoundary>
    );
  };

  Wrapper.getData = Component.getData;
  Wrapper.getKey = Component.getKey;

  return Wrapper;
}
