import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { CollectionFilterOptions } from '../features/CollectionFilterOptions';
import { CollectionItemPagination } from '../features/CollectionItemPagination';
import { CollectionPaginatedItems } from '../features/CollectionPaginatedItems';
import { CollectionTitle } from '../features/CollectionTitle';
import { usePaginatedCollection } from '../hooks/use-paginated-collection';
import { CollectionMetadata } from '../features/CollectionMetadata';

export const ViewCollection: React.FC = () => {
  const { isLoading } = usePaginatedCollection();

  if (isLoading) {
    return <DisplayBreadcrumbs />;
  }

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="collection-header">
        <CollectionTitle />

        <CollectionFilterOptions />
      </Slot>

      <Slot name="collection-pagination">
        <CollectionItemPagination />
        <div style={{ display: 'flex' }}>
          <CollectionPaginatedItems />
          <div style={{ maxWidth: 290 }}>
            <CollectionMetadata compact />
          </div>
        </div>
        <CollectionItemPagination />
      </Slot>

      <Slot name="collection-footer" />
    </>
  );
};
