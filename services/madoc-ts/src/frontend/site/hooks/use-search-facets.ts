import { useState } from 'react';
import { FacetQueryValue, useSearchQuery } from './use-search-query';

export function useSearchFacets() {
  const { fulltext, page, appliedFacets, setQuery } = useSearchQuery();
  const [appliedFacetQueue, setAppliedFacetQueue] = useState<Array<FacetQueryValue>>([]);
  const [toRemoveFacetQueue, setToRemoveFacetQueue] = useState<Array<FacetQueryValue>>([]);

  // Helpers
  const isFacetSelected = (type: string, value: string): 0 | 1 | 2 => {
    const removeQueue = toRemoveFacetQueue.find(facet => facet.k === type && facet.v === value);
    if (removeQueue) {
      return 0;
    }

    const found = appliedFacets.find(facet => facet.k === type && facet.v === value);
    const foundQueue = appliedFacetQueue.find(facet => facet.k === type && facet.v === value);

    if (found) {
      return 1;
    }

    if (foundQueue) {
      return 2;
    }

    return 0;
  };

  // Actions
  const applyFacet = (key: string, value: string) => {
    if (isFacetSelected(key, value)) {
      return;
    }
    setQuery(fulltext, [...appliedFacets, { k: key, v: value }], page);
  };

  const clearSingleFacet = (key: string, value: string) => {
    setQuery(
      fulltext,
      appliedFacets.filter(facet => !(facet.k === key && facet.v === value)),
      page
    );
  };

  const clearAllFacets = (key?: string) => {
    if (key) {
      setQuery(
        fulltext,
        appliedFacets.filter(facet => facet.k !== key),
        page
      );
    } else {
      setQuery(fulltext, [], page);
    }

    setToRemoveFacetQueue([]);
    setAppliedFacetQueue([]);
  };

  const queueSingleFacet = (key: string, value: string) => {
    setToRemoveFacetQueue(queue => {
      return queue.filter(facet => !(facet.k === key && facet.v === value));
    });
    setAppliedFacetQueue(queue => {
      const found = queue.find(facet => facet.k === key && facet.v === value);
      if (found) {
        return queue;
      }
      return [...queue, { k: key, v: value }];
    });
  };

  const dequeueSingleFacet = (key: string, value: string) => {
    setToRemoveFacetQueue(queue => {
      const found = queue.find(facet => facet.k === key && facet.v === value);
      if (found) {
        return queue;
      }
      return [...queue, { k: key, v: value }];
    });
    setAppliedFacetQueue(queue => {
      return queue.filter(facet => !(facet.k === key && facet.v === value));
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
