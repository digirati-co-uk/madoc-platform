import React, { useContext, useMemo } from 'react';
import { CreateSlotRequest, EditorialContext, SiteSlot } from '../../../types/schemas/site-page';

type ReactContextType = {
  context: EditorialContext;
  slots: {
    [slotName: string]: SiteSlot;
  };
  isPage?: boolean;
  pagePath?: string;
  editable?: boolean;
  onUpdateSlot: (slotId: number) => void;
  onCreateSlot: (slotReq: CreateSlotRequest) => void;
  onUpdateBlock: (blockId: number) => void | Promise<void>;
  beforeCreateSlot: (slotReq: CreateSlotRequest) => void;
  invalidateSlots: () => void | Promise<void>;
};

const SlotReactContext = React.createContext<ReactContextType>({
  context: {},
  slots: {},
  editable: false,
  isPage: false,
  invalidateSlots: () => {
    // no-op.
  },
  onUpdateSlot: () => {
    // no-op.
  },
  onCreateSlot: () => {
    // no-op
  },
  beforeCreateSlot: () => {
    // no-op
  },
  onUpdateBlock: () => {
    // no-op
  },
});

SlotReactContext.displayName = 'Slot';

export const useSlots = () => {
  return useContext(SlotReactContext);
};

type SlotProviderProps = {
  pagePath?: string;
  slug?: string;
  context?: EditorialContext;
  isPage?: boolean;
  slots?: { [slotName: string]: SiteSlot };
  editable?: boolean;
  invalidateSlots?: () => void | Promise<void>;
  onUpdateSlot?: (slotId: number) => void | Promise<void>;
  onCreateSlot?: (slotReq: CreateSlotRequest) => void | Promise<void>;
  onUpdateBlock?: (blockId: number) => void | Promise<void>;
  beforeCreateSlot?: (slotReq: CreateSlotRequest) => void | Promise<void>;
};

export const CustomRouteContext: React.FC<{ ctx: Partial<EditorialContext> }> = ({ ctx, children }) => {
  const slots = useSlots();

  const newContext = useMemo(() => {
    return {
      ...slots,
      context: {
        ...slots.context,
        ...(ctx || {}),
      },
    };
  }, [ctx, slots]);

  return <SlotReactContext.Provider value={newContext}>{children}</SlotReactContext.Provider>;
};

export const SlotProvider: React.FC<SlotProviderProps> = props => {
  const existing = useSlots();

  // @todo fetch new slots.
  const newSlots = {};

  const newContext = useMemo(() => {
    return {
      isPage: existing.isPage ? props.isPage : props.isPage,
      pagePath: existing.pagePath ? existing.pagePath : props.pagePath,
      context: { ...existing.context, ...props.context },
      slots: { ...existing.slots, ...(props.slots || {}), ...newSlots }, // Possibly merge the slots based on the priority thing.
      editable: typeof props.editable !== 'undefined' ? props.editable : existing.editable,
      onUpdateSlot: async (slotId: number) => {
        if (props.onUpdateSlot) {
          await props.onUpdateSlot(slotId);
        }
        return existing.onUpdateSlot(slotId);
      },
      beforeCreateSlot: async (slot: CreateSlotRequest) => {
        if (props.beforeCreateSlot) {
          await props.beforeCreateSlot(slot);
        }
        return existing.beforeCreateSlot(slot);
      },
      onCreateSlot: async (slot: CreateSlotRequest) => {
        if (props.onCreateSlot) {
          await props.onCreateSlot(slot);
        }
        return existing.onCreateSlot(slot);
      },
      onUpdateBlock: async (blockId: number) => {
        if (props.onUpdateBlock) {
          await props.onUpdateBlock(blockId);
        }
        return existing.onUpdateBlock(blockId);
      },
      invalidateSlots: async () => {
        if (props.invalidateSlots) {
          await props.invalidateSlots();
        }
        return existing.invalidateSlots();
      },
    };
  }, [existing, props, newSlots]);

  return <SlotReactContext.Provider value={newContext}>{props.children}</SlotReactContext.Provider>;
};
