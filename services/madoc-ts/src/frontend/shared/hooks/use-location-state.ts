import { parse, stringify } from 'query-string';
import { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useLocationState<T = any>() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = useMemo(() => {
    return (location.search ? parse(location.search) : {}) as any;
  }, [location]) as T;

  const setState = useCallback(
    (newState: Partial<T>) => {
      const newSearch = stringify({ ...state, ...newState });
      navigate(`${location.pathname}?${newSearch}`);
    },
    [state, location.pathname]
  );

  return [state, setState] as const;
}
