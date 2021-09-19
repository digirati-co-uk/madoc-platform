import React, { useMemo } from 'react';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';
import { SlotLayout } from '../layout/SlotLayout';
import { SurfaceProps } from '../layout/Surface';
import { RenderBlock } from './render-block';
import { SlotEditor } from './slot-editor';

export type RenderSlotProps = {
  slot: SiteSlot;
  context?: EditorialContext;
  editable?: boolean;
  onUpdateSlot?: () => void;
  onUpdateBlock?: (blockId: number) => void | Promise<void>;
  invalidateSlots?: () => void | Promise<void>;
  defaultContents?: any;
  pagePath?: string;
  layout?: string;
  source?: { type: string; id: string };
  noSurface?: boolean;
  small?: boolean;
};

export const RenderSlot: React.FC<RenderSlotProps> = props => {
  const layout = props.layout || props.slot.layout;
  const surfaceProps = props.slot?.props?.surface as SurfaceProps;

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
        small={props.small}
        noSurface={props.noSurface}
        layout={layout}
        slot={props.slot}
        blocks={orderedBlocks}
        context={props.context}
        onUpdateSlot={props.onUpdateSlot}
        onUpdateBlock={props.onUpdateBlock}
        invalidateSlots={props.invalidateSlots}
        defaultContents={props.defaultContents}
        surfaceProps={surfaceProps}
        pagePath={props.pagePath}
        source={props.source}
      />
    );
  }

  return (
    <SlotLayout layout={layout} surfaceProps={surfaceProps} noSurface={props.noSurface}>
      {orderedBlocks.map(block => {
        return <RenderBlock key={block.id} block={block} context={props.context} />;
      })}
    </SlotLayout>
  );
};
