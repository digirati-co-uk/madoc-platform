import React, { useCallback } from 'react';
import { RenderBlankSlot } from './render-blank-slot';
import { RenderSlot } from './render-slot';
import { useSlots } from './slot-context';

export const Slot: React.FC<{ name: string }> = props => {
  const { slots, context, editable, onUpdateSlot, onUpdateBlock } = useSlots();

  const slot = slots[props.name];

  const slotId = slot ? slot.id : undefined;
  const updateSlot = useCallback(() => (slotId ? onUpdateSlot(slotId) : undefined), [onUpdateSlot, slotId]);

  // return React.Children.map(props.children, c => {
  //   if (c && typeof c === 'object' && c.type[Symbol.for('slot-model')]) {
  //     console.log(c.type[Symbol.for('slot-model')]);
  //
  //     return <pre>{JSON.stringify(captureModelShorthand(c.type[Symbol.for('slot-model')]), null, 2)}</pre>;
  //   }
  //
  //   return c;
  // });

  // Create a debug page here.
  // - list the slots
  // - Create a slot from the default, by creating all of the blocks.
  // -

  // if (!slot) {
  //   const blockDefinitions = extractBlockDefinitions(props.children);
  //
  //   const newSlot: CreateSlotRequest = {
  //     slotId: props.name,
  //     label: { none: ['A slot'] },
  //     layout: 'stack',
  //     filters: {
  //       // @todo default filter using data provided by slot.
  //     },
  //     blocks: blockDefinitions.map(definition => {
  //       return {
  //         name: '',
  //         type: definition.type,
  //         static_data: { ...definition.defaultData },
  //         lazy: false,
  //       };
  //     }),
  //   };
  //
  //   return (
  //     <div style={{ border: '3px solid red' }}>
  //       <RenderSlot
  //         slot={newSlot}
  //         context={context}
  //         editable={true}
  //         onUpdateSlot={() => {
  //           console.log('slot updated!');
  //         }}
  //       />
  //     </div>
  //   );
  // }

  if (!slot) {
    return <RenderBlankSlot name={props.name}>{props.children}</RenderBlankSlot>;
  }

  return (
    <RenderSlot
      slot={slot}
      context={context}
      editable={editable}
      onUpdateSlot={updateSlot}
      onUpdateBlock={onUpdateBlock}
      defaultContents={props.children}
    />
  );
};
