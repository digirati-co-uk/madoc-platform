import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../shared/layout/WidePage';
import { AdminHeader } from '../../molecules/AdminHeader';

export function ManageTopicTypes() {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        title={t('All Topic Types')}
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
          {
            label: t('All Types'),
            link: `/topics/types`,
            active: true,
          },
        ]}
        subtitle={t('')}
        menu={[
          {
            label: t('All Types'),
            link: `/topics/types`,
          },
          {
            label: t('Create new'),
            link: `/topics/types/_/create-type`,
          },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
