import { stringify } from 'query-string';
import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useRouteContext } from './use-route-context';

export type FacetQueryValue = { k: string; v: string };

export function useSearchQuery() {
  const query = useLocationQuery<{ fulltext?: string; rscType?: string; facets?: string; page?: string }>();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const { topic } = useRouteContext();
  const fulltext = query.fulltext || '';
  const rscType = query.rscType || '';
  const appliedFacets: FacetQueryValue[] = useMemo(() => (query.facets ? JSON.parse(query.facets) : []), [
    query.facets,
  ]);
  const page = query.page ? Number(query.page) : 1;
  const setQuery = useCallback(
    (newFulltext: string, newFacets: Array<FacetQueryValue>, newRscType?: string, newPage?: number) => {
      const newHash = topic && !hash ? '#topic' : hash;
      // @todo New list of facets applied to location.
      navigate(
        `${pathname}?${stringify({
          fulltext: newFulltext,
          rscType: newRscType,
          facets: newFacets.length ? JSON.stringify(newFacets) : undefined,
          page: newPage && newPage > 1 ? newPage : undefined,
        })}${newHash}`
      );
    },
    [hash, navigate, pathname, topic]
  );

  const rawQuery = useMemo(
    () => ({
      fulltext: fulltext,
      rscType: rscType,
      facets: appliedFacets.length ? JSON.stringify(appliedFacets) : undefined,
      page: page && page > 1 ? page : undefined,
    }),
    [appliedFacets, fulltext, page, rscType]
  );

  return useMemo(() => {
    return {
      rawQuery,
      page,
      fulltext,
      rscType,
      appliedFacets,
      setQuery,
    };
  }, [rawQuery, page, fulltext, rscType, appliedFacets, setQuery]);
}
