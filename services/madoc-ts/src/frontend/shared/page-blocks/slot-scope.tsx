import React from 'react';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';
import { Heading2 } from '../typography/Heading2';
import { EditShorthandCaptureModel } from '../capture-models/EditorShorthandCaptureModel';
import { CaptureModelShorthand } from '../../../extensions/projects/types';

export const SlotScope: React.FC<{ slot: SiteSlot; context?: EditorialContext }> = ({ slot, context }) => {
  const existingFilters = slot.filters;
  const options = [
    {
      text: 'None',
      value: 'none',
    },
    {
      text: 'All',
      value: 'all',
    },
    {
      text: 'Exact',
      value: 'exact',
    },
  ];
  const slotScopeShorthand: CaptureModelShorthand<any> = {
    project: {
      label: 'project',
      type: 'dropdown-field',
      inline: true,
      value: existingFilters?.project || 'none',
      options,
    },
    collection: {
      label: 'collection',
      type: 'dropdown-field',
      inline: true,
      value: existingFilters?.collection || 'none',
      options,
    },
    manifest: {
      label: 'manifest',
      type: 'dropdown-field',
      inline: true,
      value: existingFilters?.manifest || 'none',
      options,
    },
    canvas: {
      label: 'canvas',
      type: 'dropdown-field',
      inline: true,
      value: existingFilters?.canvas || 'none',
      options,
    },
  };

  const data = {
    canvas: existingFilters?.canvas?.exact ? 'exact' : existingFilters?.canvas?.all ? 'all' : 'none',
    collection: existingFilters?.collection?.exact ? 'exact' : existingFilters?.collection?.all ? 'all' : 'none',
    manifest: existingFilters?.manifest?.exact ? 'exact' : existingFilters?.manifest?.all ? 'all' : 'none',
    project: existingFilters?.project?.exact ? 'exact' : existingFilters?.project?.all ? 'all' : 'none',
  };

  return (
    <div style={{ display: 'flex' }}>
      <div>
        <Heading2>Scope</Heading2>
        <EditShorthandCaptureModel template={slotScopeShorthand} data={data} />
      </div>
    </div>
  );
};
