import { SortingState } from '@tanstack/react-table';
import { parse, stringify } from 'query-string';
import { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useLocationState<T = any>({ sortKey = 'sort' }: { sortKey?: string } = {}) {
  const location = useLocation();
  const navigate = useNavigate();

  const state = useMemo(() => {
    return (location.search ? parse(location.search) : {}) as any;
  }, [location]) as T;

  const sortingState: SortingState = useMemo(() => {
    const split = (state as any)[sortKey]?.split(':');
    if (!split || !split.length) {
      return [];
    }
    const [sortId, sortDir] = split;

    return [
      {
        id: sortId,
        desc: sortDir === 'desc',
        sortDir,
      },
    ];
  }, [state, sortKey]);

  const sort = sortingState[0];

  const setState = useCallback(
    (newState: Partial<T>) => {
      const newSearch = stringify({ ...state, ...newState });
      navigate(`${location.pathname}?${newSearch}`);
    },
    [state, location.pathname]
  );

  const onSortingChange = useCallback(
    (val: any) => {
      const newSort = (val as any)(sortingState);

      if (newSort[0]) {
        setState({ ...state, sort: `${newSort[0].id}:${newSort[0].desc ? 'desc' : 'asc'}` });
      } else {
        setState({ ...state, sort: undefined });
      }
    },
    [state, sortingState, setState]
  );

  return [
    state,
    setState,
    {
      sort,
      sortingState,
      onSortingChange,
    },
  ] as const;
}
