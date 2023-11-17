import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/typography/Heading1';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { AllCollectionsPaginatedItems } from '../blocks/AllCollectionsPaginatedItems';
import { AllCollectionsPagination } from '../blocks/AllCollectionsPagination';
import { StaticPage } from '../features/viewPage/StaticPage';

export const AllCollections: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StaticPage title="All collections">
      <Slot name="all-collections-header">
        <DisplayBreadcrumbs />
        <Heading1>{t('All collections')}</Heading1>
        <AllCollectionsPagination />
      </Slot>

      <Slot name="all-collections-body">
        <AllCollectionsPaginatedItems />
      </Slot>

      <Slot name="all-collections-footer">
        <AllCollectionsPagination />
      </Slot>
    </StaticPage>
  );
};
