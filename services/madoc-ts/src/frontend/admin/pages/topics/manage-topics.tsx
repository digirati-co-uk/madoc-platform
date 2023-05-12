import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../shared/layout/WidePage';
import { AdminHeader } from '../../molecules/AdminHeader';

export function ManageTopics() {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        title={t('All Topics')}
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
          {
            label: t('All topics '),
            link: `/topics/all`,
            active: true,
          },
        ]}
        subtitle={t('')}
        menu={[
          {
            label: t('All Topics'),
            link: `/topics/all`,
          },
          {
            label: t('Create new'),
            link: `/topics/all/_/create-topic`,
          },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
