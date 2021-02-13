import React, { useContext, useMemo } from 'react';
import { CreateSlotRequest, EditorialContext, SiteSlot } from '../../../types/schemas/site-page';

type ReactContextType = {
  context: EditorialContext;
  slots: {
    [slotName: string]: SiteSlot;
  };
  editable?: boolean;
  onUpdateSlot: (slotId: number) => void;
  onCreateSlot: (slotReq: CreateSlotRequest) => void;
  beforeCreateSlot: (slotReq: CreateSlotRequest) => void;
};

const SlotReactContext = React.createContext<ReactContextType>({
  context: {},
  slots: {},
  editable: false,
  onUpdateSlot: () => {
    // no-op.
  },
  onCreateSlot: () => {
    // no-op
  },
  beforeCreateSlot: () => {
    // no-op
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
  onCreateSlot?: (slotReq: CreateSlotRequest) => void | Promise<void>;
  beforeCreateSlot?: (slotReq: CreateSlotRequest) => void;
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
      beforeCreateSlot: (slot: CreateSlotRequest) => {
        if (props.beforeCreateSlot) {
          props.beforeCreateSlot(slot);
        }
        existing.beforeCreateSlot(slot);
      },
      onCreateSlot: async (slot: CreateSlotRequest) => {
        if (props.onCreateSlot) {
          await props.onCreateSlot(slot);
        }
        existing.onCreateSlot(slot);
      },
    };
  }, [existing, props, newSlots]);

  return <SlotReactContext.Provider value={newContext}>{props.children}</SlotReactContext.Provider>;
};
