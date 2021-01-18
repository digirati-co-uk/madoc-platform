import React, { useCallback } from 'react';
import { RenderSlot } from './render-slot';
import { useSlots } from './slot-context';

export const Slot: React.FC<{ name: string }> = props => {
  const { slots, context, editable, onUpdateSlot } = useSlots();

  const slot = slots[props.name];

  const slotId = slot ? slot.id : undefined;
  const updateSlot = useCallback(() => (slotId ? onUpdateSlot(slotId) : undefined), [onUpdateSlot, slotId]);

  if (!slot) {
    return <>{props.children}</>;
  }

  return <RenderSlot slot={slot} context={context} editable={editable} onUpdateSlot={updateSlot} />;
};
