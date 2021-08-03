import React, { useCallback } from 'react';
import { RenderBlankSlot } from './render-blank-slot';
import { RenderSlot } from './render-slot';
import { useSlots } from './slot-context';

export const Slot: React.FC<{
  name: string;
  hidden?: boolean;
  layout?: string;
  noSurface?: boolean;
  small?: boolean;
  source?: { type: string; id: string };
}> = props => {
  const { slots, context, editable, onUpdateSlot, onUpdateBlock, invalidateSlots, pagePath } = useSlots();

  const slot = slots[props.name];

  const slotId = slot ? slot.id : undefined;
  const updateSlot = useCallback(() => (slotId ? onUpdateSlot(slotId) : undefined), [onUpdateSlot, slotId]);

  if (props.hidden && !editable) {
    return null;
  }

  if (!slot) {
    return (
      <RenderBlankSlot name={props.name} source={props.source} layout={props.layout}>
        {props.children}
      </RenderBlankSlot>
    );
  }

  return (
    <RenderSlot
      small={props.small}
      noSurface={props.noSurface}
      layout={props.layout}
      slot={slot}
      context={context}
      editable={editable}
      onUpdateSlot={updateSlot}
      onUpdateBlock={onUpdateBlock}
      invalidateSlots={invalidateSlots}
      defaultContents={props.children}
      pagePath={pagePath}
      source={props.source}
    />
  );
};
