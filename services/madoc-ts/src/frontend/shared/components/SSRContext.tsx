import { createContext, useContext } from 'react';

export const SSRContext = createContext<any>(undefined);

export const useIsServer = () => {
  const ctx = useContext(SSRContext);
  return !!ctx;
};
