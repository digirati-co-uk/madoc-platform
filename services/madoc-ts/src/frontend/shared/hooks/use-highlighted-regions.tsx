import React, { useCallback, useContext, useMemo, useState } from 'react';

type HighlightedRegionContext = {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;

  currentCollection: string | undefined;
  setCurrentCollection(id: string | undefined): void;

  regionCollections: Array<{ id: string; label: string }>;
  setRegionCollections(collections: Array<{ id: string; label: string }>): void;

  regions: Array<{ id: any; label: string; target: { x: number; y: number; height: number; width: number } }>;
  setRegions(
    regions: Array<{ id: any; label: string; target: { x: number; y: number; height: number; width: number } }>
  ): void;

  highlighted: any[];
  setHighlightStatus(id: any, isHighlighted: boolean): void;
};

const defaultContext: HighlightedRegionContext = {
  isActive: false,
  setIsActive() {
    // no-op
  },

  currentCollection: undefined,
  setCurrentCollection() {
    // no-op
  },

  regionCollections: [],
  setRegionCollections() {
    // no-op
  },

  regions: [],
  setRegions() {
    // no-op
  },

  highlighted: [],
  setHighlightStatus() {
    // no-op
  },
};

const HighlightedRegions = React.createContext(defaultContext);

export function useHighlightedRegions() {
  return useContext(HighlightedRegions);
}

export const HighlightedRegionProvider: React.FC = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<HighlightedRegionContext['currentCollection']>();
  const [regionCollections, setRegionCollections] = useState<HighlightedRegionContext['regionCollections']>([]);
  const [regions, setRegions] = useState<HighlightedRegionContext['highlighted']>([]);
  const [highlightedRegions, setHighlightedRegions] = useState<HighlightedRegionContext['highlighted']>([]);

  const setHighlightStatus: HighlightedRegionContext['setHighlightStatus'] = useCallback((id, isHighlighted) => {
    setHighlightedRegions((prev: any[]) => {
      if (isHighlighted) {
        if (prev.indexOf(id) !== -1) {
          return prev;
        }
        return [...prev, id];
      }

      return prev.filter(r => r !== id);
    });
  }, []);

  const ctx: HighlightedRegionContext = useMemo(() => {
    return {
      isActive,
      setIsActive,
      regionCollections,
      currentCollection,
      highlighted: highlightedRegions,
      setHighlightStatus,
      regions,
      setRegions,
      setCurrentCollection,
      setRegionCollections,
    };
  }, [currentCollection, highlightedRegions, isActive, regionCollections, regions, setHighlightStatus]);

  return <HighlightedRegions.Provider value={ctx}>{children}</HighlightedRegions.Provider>;
};
