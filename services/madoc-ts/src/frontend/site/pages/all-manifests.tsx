import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/atoms/Heading1';
import { Slot } from '../../shared/page-blocks/slot';
import { AllManifestsPaginatedItems } from '../features/AllManifestsPaginatedItems';
import { AllManifestsPagination } from '../features/AllManifestsPagination';
import { StaticPage } from '../features/StaticPage';

export const AllManifests: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StaticPage title="All manifests">
      <Slot name="all-manifests-header">
        <Heading1>{t('All manifests')}</Heading1>
        <AllManifestsPagination />
      </Slot>
      <Slot name="all-manifests-body">
        <AllManifestsPaginatedItems />
      </Slot>
      <Slot name="all-manifests-footer">
        <AllManifestsPagination />
      </Slot>
    </StaticPage>
  );
};
