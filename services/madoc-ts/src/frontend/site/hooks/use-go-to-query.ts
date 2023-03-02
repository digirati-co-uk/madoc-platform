import { stringify } from 'query-string';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

export function useGoToQuery(ignore: string[] = ['page']) {
  const navigate = useNavigate();
  const location = useLocation();
  const originalQuery = useLocationQuery();
  const query = useMemo(() => {
    const toReturn: any = {};
    for (const key of Object.keys(originalQuery)) {
      if (ignore.indexOf(key) === -1) {
        toReturn[key] = originalQuery[key];
      }
    }
    return toReturn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalQuery, ...ignore]);

  return (newQuery: any = {}) => {
    navigate(`${location.pathname}?${stringify({ ...query, ...newQuery }, { arrayFormat: 'comma' })}`);
  };
}
