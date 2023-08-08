import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { SystemBackground } from '../../../shared/atoms/SystemUI';
import { AdminHeader } from '../../molecules/AdminHeader';

export function TermConfigurations() {
  const { t } = useTranslation();
  return (
    <>
      <AdminHeader
        title={t('Term configurations')}
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Configure site'), link: '/configure/site' },
          { label: t('Term configurations'), link: '/configure/site/terms' },
        ]}
        noMargin
      />
      <SystemBackground>
        <Outlet />
      </SystemBackground>
    </>
  );
}
