import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const Media: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        title={t('Media')}
        subtitle={t('Manage media')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Media', link: '/media' },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
};
