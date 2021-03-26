import { stringify } from 'query-string';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

export function useGoToQuery(ignore: string[] = ['page']) {
  const { location, push } = useHistory();
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
    push(`${location.pathname}?${stringify({ ...query, ...newQuery }, { arrayFormat: 'comma' })}`);
  };
}
