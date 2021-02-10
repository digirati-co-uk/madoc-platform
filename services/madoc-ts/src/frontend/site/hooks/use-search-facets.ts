import { useState } from 'react';
import { FacetQueryValue, useSearchQuery } from './use-search-query';

export function useSearchFacets() {
  const { fulltext, page, appliedFacets, setQuery } = useSearchQuery();
  const [appliedFacetQueue, setAppliedFacetQueue] = useState<Array<FacetQueryValue>>([]);
  const [toRemoveFacetQueue, setToRemoveFacetQueue] = useState<Array<FacetQueryValue>>([]);

  // Helpers
  const isFacetSelected = (type: string, values: string[]): 0 | 1 | 2 => {
    const removeQueue = toRemoveFacetQueue.find(facet => facet.k === type && values.indexOf(facet.v) !== -1);
    if (removeQueue) {
      return 0;
    }

    const found = appliedFacets.find(facet => facet.k === type && values.indexOf(facet.v) !== -1);
    const foundQueue = appliedFacetQueue.find(facet => facet.k === type && values.indexOf(facet.v) !== -1);

    if (found) {
      return 1;
    }

    if (foundQueue) {
      return 2;
    }

    return 0;
  };

  // Actions
  const applyFacet = (key: string, values: string[]) => {
    if (isFacetSelected(key, values)) {
      return;
    }

    setQuery(fulltext, [...appliedFacets, ...values.map(value => ({ k: key, v: value }))], page);
  };

  const clearSingleFacet = (key: string, values: string[]) => {
    setQuery(
      fulltext,
      appliedFacets.filter(facet => !(facet.k === key && values.indexOf(facet.v) !== -1)),
      page
    );
  };

  const clearAllFacets = (key?: string[]) => {
    if (key) {
      setQuery(
        fulltext,
        appliedFacets.filter(facet => key.indexOf(facet.k) !== -1),
        page
      );
    } else {
      setQuery(fulltext, [], page);
    }

    setToRemoveFacetQueue([]);
    setAppliedFacetQueue([]);
  };

  const queueSingleFacet = (key: string, values: string[]) => {
    setToRemoveFacetQueue(queue => {
      return queue.filter(facet => !(facet.k === key && values.indexOf(facet.v) !== -1));
    });
    setAppliedFacetQueue(queue => {
      const found = queue.filter(facet => facet.k === key && values.indexOf(facet.v) !== -1);
      if (found.length) {
        return queue;
      }
      return [...queue, ...values.map(value => ({ k: key, v: value }))];
    });
  };

  const dequeueSingleFacet = (key: string, values: string[]) => {
    setToRemoveFacetQueue(queue => {
      const found = queue.filter(facet => facet.k === key && values.indexOf(facet.v) !== -1);
      if (found.length) {
        return queue;
      }
      return [...queue, ...values.map(value => ({ k: key, v: value }))];
    });
    setAppliedFacetQueue(queue => {
      return queue.filter(facet => !(facet.k === key && values.indexOf(facet.v) !== -1));
    });
  };

  const applyAllFacets = () => {
    const removeQueueHash = toRemoveFacetQueue.map(queue => `${queue.k}::${queue.v}`);
    setQuery(
      fulltext,
      [...appliedFacets, ...appliedFacetQueue].filter(queue => {
        return removeQueueHash.indexOf(`${queue.k}::${queue.v}`) === -1;
      }),
      page
    );
    setAppliedFacetQueue([]);
    setToRemoveFacetQueue([]);
  };

  const setFullTextQuery = (newFullText: string) => {
    setQuery(newFullText, appliedFacets, page);
  };

  return {
    inQueue: toRemoveFacetQueue.length || appliedFacetQueue.length,
    applyFacet,
    clearSingleFacet,
    clearAllFacets,
    queueSingleFacet,
    dequeueSingleFacet,
    applyAllFacets,
    isFacetSelected,
    setFullTextQuery,
  };
}
