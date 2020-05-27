import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { parse } from 'query-string';

export function useLocationQuery<T = any>() {
  const location = useLocation();

  return useMemo(() => {
    return (location.search ? parse(location.search) : {}) as any;
  }, [location]) as T;
}
