import React, { useContext, useMemo } from 'react';

const RefetchReactContext = React.createContext(async () => {
  // no-op
});

RefetchReactContext.displayName = 'Refetch';

export function useRefetch() {
  return useContext(RefetchReactContext);
}

export function RefetchProvider({ refetch, children }: { refetch: () => Promise<any>; children: React.ReactNode }) {
  const existing = useContext(RefetchReactContext);

  const newValue = useMemo(() => {
    return async () => {
      await Promise.all([refetch(), existing()]);
    };
  }, [existing, refetch]);

  return <RefetchReactContext.Provider value={newValue}>{children}</RefetchReactContext.Provider>;
}
