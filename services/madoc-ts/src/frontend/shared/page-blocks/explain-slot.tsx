import React from 'react';
import { EditorialContext, SiteSlot } from '../../../types/schemas/site-page';

export const ExplainSlot: React.FC<{ slot: SiteSlot; context?: EditorialContext }> = ({ slot, context }) => {
  if (
    !slot.filters ||
    (slot.filters.project?.none &&
      slot.filters.collection?.none &&
      slot.filters.manifest?.none &&
      slot.filters.canvas?.none)
  ) {
    return (
      <div>This slot is part of this page, defined in the page layout. This should only be visible on this page.</div>
    );
  }

  return <div>Incomplete - but check back soon!</div>;
};
