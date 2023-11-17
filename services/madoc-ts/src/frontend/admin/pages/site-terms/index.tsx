import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { SystemBackground } from '../../../shared/atoms/SystemUI';
import { AdminHeader } from '../../molecules/AdminHeader';

export function SiteTerms() {
  const { t } = useTranslation();
  return (
    <>
      <AdminHeader
        title={t('Terms and conditions')}
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Configure site'), link: '/configure/site' },
          { label: t('Terms and conditions'), link: '/configure/site/terms-and-conditions' },
        ]}
        noMargin
        action={{
          link: '/configure/site/terms-and-conditions/list',
          label: t('Show history'),
        }}
      />
      <SystemBackground>
        <Outlet />
      </SystemBackground>
    </>
  );
}
