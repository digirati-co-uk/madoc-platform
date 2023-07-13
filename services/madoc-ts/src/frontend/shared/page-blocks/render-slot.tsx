import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';
import { SlotLayout } from '../layout/SlotLayout';
import { SurfaceProps } from '../layout/Surface';
import { RenderBlock } from './render-block';
import { SlotEditor } from './slot-editor';
import { sortSiteBlocks } from './sort-site-blocks';

export type RenderSlotProps = {
  id?: string;
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
  const { i18n } = useTranslation();
  const layout = props.layout || props.slot.layout;
  const surfaceProps = props.slot?.props?.surface as SurfaceProps;
  const language = i18n.language;

  const orderedBlocks = useMemo(() => {
    return sortSiteBlocks([...props.slot.blocks], language);
  }, [props.editable, language, props.slot]);

  const allBlocks = useMemo(() => {
    if (!props.editable) {
      return [];
    }
    return sortSiteBlocks([...props.slot.blocks], language, false);
  }, [props.editable, language, props.slot]);

  if (props.editable) {
    return (
      <SlotEditor
        small={props.small}
        noSurface={props.noSurface}
        layout={layout}
        slot={props.slot}
        blocks={allBlocks}
        visibleBlocks={orderedBlocks}
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
    <SlotLayout id={props.id} layout={layout} surfaceProps={surfaceProps} noSurface={props.noSurface}>
      {orderedBlocks.map(block => {
        return <RenderBlock key={block.id} block={block} context={props.context} />;
      })}
    </SlotLayout>
  );
};
