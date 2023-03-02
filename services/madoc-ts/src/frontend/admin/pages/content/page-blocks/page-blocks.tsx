import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const PageBlocks: React.FC = () => {
  const { t } = useTranslation();

  // api.pageBlocks.get

  return (
    <>
      <AdminHeader
        title={t('Page blocks')}
        subtitle={t('Manage pages, slots and blocks')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Page blocks', link: '/page-blocks' },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
};
