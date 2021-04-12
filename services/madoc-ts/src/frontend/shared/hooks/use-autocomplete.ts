import { useApi } from './use-api';
import { useCallback, useState } from 'react';

export function useAutocomplete(q?: string, project?: string) {
  const api = useApi();
  const [searchResultsType, setSearchResultsType] = useState('');
  const [searchResults, setSearchResults] = useState<undefined | Array<{ id: number; label: string }>>();

  const performSearch = useCallback(
    (type: string) => {
      if (q) {
        if (type === 'manifest') {
          api.autocompleteManifests(q, project).then(results => {
            setSearchResultsType(type);
            setSearchResults(results);
          });
        } else {
          api.autocompleteCollections(q, project).then(results => {
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
