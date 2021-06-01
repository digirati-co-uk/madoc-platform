import { useApi } from './use-api';
import { useCallback, useState } from 'react';

export function useAutocomplete(
  q?: string,
  { project, blacklistIds }: { project?: string; blacklistIds?: number[] } = {}
) {
  const api = useApi();
  const [searchResultsType, setSearchResultsType] = useState('');
  const [searchResults, setSearchResults] = useState<undefined | Array<{ id: number; label: string }>>();

  const performSearch = useCallback(
    (type: string, page: number = 1) => {
      if (q) {
        if (type === 'manifest') {
          api.autocompleteManifests(q, project, blacklistIds, page).then(results => {
            setSearchResultsType(type);
            setSearchResults(results);
          });
        } else {
          api.autocompleteCollections(q, project, blacklistIds, page).then(results => {
            setSearchResultsType(type);
            setSearchResults(results);
          });
        }
      }
    },
    [api, q]
  );

  const reset = useCallback(() => {
    setSearchResults(undefined);
  }, []);

  return [performSearch, searchResultsType, searchResults, reset] as const;
}
