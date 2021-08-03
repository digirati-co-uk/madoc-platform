import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/atoms/Heading1';
import { Slot } from '../../shared/page-blocks/slot';
import { AllProjectsPaginatedItems } from '../features/AllProjectsPaginatedItems';
import { AllProjectsPagination } from '../features/AllProjectsPagination';
import { StaticPage } from '../features/StaticPage';

export const AllProjects: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StaticPage title="All projects">
      <Slot name="all-projects-header">
        <Heading1>{t('All projects')}</Heading1>
        <AllProjectsPagination />
      </Slot>
      <Slot name="all-projects-body">
        <AllProjectsPaginatedItems />
      </Slot>
      <Slot name="all-projects-footer">
        <AllProjectsPagination />
      </Slot>
    </StaticPage>
  );
};
