import React, { useMemo } from 'react';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';
import { RenderBlock } from './render-block';
import { SlotEditor } from './slot-editor';

export type RenderSlotProps = {
  slot: SiteSlot;
  context?: EditorialContext;
  editable?: boolean;
  onUpdateSlot?: () => void;
};

export const RenderSlot: React.FC<RenderSlotProps> = props => {
  const layout = props.slot.layout;

  const orderedBlocks = useMemo(() => {
    return [...props.slot.blocks].sort((a, b) => {
      const aOrder = typeof a.order === 'undefined' ? Infinity : a.order;
      const bOrder = typeof b.order === 'undefined' ? Infinity : b.order;

      return aOrder > bOrder ? 1 : -1;
    });
  }, [props.slot]);

  if (props.editable) {
    return (
      <SlotEditor
        layout={layout}
        slot={props.slot}
        blocks={orderedBlocks}
        context={props.context}
        onUpdateSlot={props.onUpdateSlot}
      />
    );
  }

  switch (layout) {
    // @todo more layouts.
    case 'stack':
    case 'none':
    default: {
      return (
        <>
          {orderedBlocks.map(block => {
            return <RenderBlock key={block.id} block={block} context={props.context} />;
          })}
        </>
      );
    }
  }
};
