import { stringify } from 'query-string';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

export type FacetQueryValue = { k: string; v: string };

export function useSearchQuery() {
  const query = useLocationQuery<{ fulltext?: string; facets?: string; page?: string }>();
  const history = useHistory();
  const { pathname } = useLocation();
  const fulltext = query.fulltext || '';
  const appliedFacets: FacetQueryValue[] = useMemo(() => (query.facets ? JSON.parse(query.facets) : []), [
    query.facets,
  ]);
  const page = query.page ? Number(query.page) : 1;

  const setQuery = useCallback(
    (newFulltext: string, newFacets: Array<FacetQueryValue>, newPage?: number) => {
      // @todo New list of facets applied to location.
      history.push(
        `${pathname}?${stringify({
          fulltext: newFulltext,
          facets: newFacets.length ? JSON.stringify(newFacets) : undefined,
          page: newPage && newPage > 1 ? newPage : undefined,
        })}`
      );
    },
    [history, pathname]
  );

  return useMemo(() => {
    return {
      page,
      fulltext,
      appliedFacets,
      setQuery,
    };
  }, [appliedFacets, fulltext, setQuery]);
}
