import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { SystemBackground } from '../../../shared/atoms/SystemUI';
import { AdminHeader } from '../../molecules/AdminHeader';

export function Badges() {
  const { t } = useTranslation();
  return (
    <>
      <AdminHeader
        title={t('Badges')}
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Configure site'), link: '/configure/site' },
          { label: t('Badges'), link: '/configure/site/badges' },
        ]}
        noMargin
      />
      <SystemBackground>
        <Outlet />
      </SystemBackground>
    </>
  );
}
