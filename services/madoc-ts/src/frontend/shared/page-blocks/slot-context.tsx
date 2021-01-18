import React, { useContext, useMemo } from 'react';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';
import { useBreads } from '../caputre-models/RevisionBreadcrumbs';

type ReactContextType = {
  context: EditorialContext;
  slots: {
    [slotName: string]: SiteSlot;
  };
  editable?: boolean;
  onUpdateSlot: (slotId: number) => void;
};

const SlotReactContext = React.createContext<ReactContextType>({
  context: {},
  slots: {},
  editable: false,
  onUpdateSlot: () => {
    // no-op.
  },
});

export const useSlots = () => {
  return useContext(SlotReactContext);
};

type SlotProviderProps = {
  pagePath?: string;
  slug?: string;
  context?: EditorialContext;
  slots?: { [slotName: string]: SiteSlot };
  editable?: boolean;
  onUpdateSlot?: (slotId: number) => void;
};

export const SlotProvider: React.FC<SlotProviderProps> = props => {
  const existing = useSlots();

  // @todo fetch new slots.
  const newSlots = {};

  const newContext = useMemo(() => {
    return {
      context: { ...existing.context, ...props.context },
      slots: { ...existing.slots, ...(props.slots || {}), ...newSlots }, // Possibly merge the slots based on the priority thing.
      editable: typeof props.editable !== 'undefined' ? props.editable : existing.editable,
      onUpdateSlot: (slotId: number) => {
        if (props.onUpdateSlot) {
          props.onUpdateSlot(slotId);
        }
        existing.onUpdateSlot(slotId);
      },
    };
  }, [existing, props, newSlots]);

  return <SlotReactContext.Provider value={newContext}>{props.children}</SlotReactContext.Provider>;
};
