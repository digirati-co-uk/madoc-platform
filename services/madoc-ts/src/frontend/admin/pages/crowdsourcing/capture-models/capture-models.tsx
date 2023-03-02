import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { Outlet, useParams } from 'react-router-dom';

export const CaptureModels = createUniversalComponent(() => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Capture models'), link: '/capture-models', active: true },
        ]}
        title="Capture models"
        menu={[
          { label: t('Home'), link: `/capture-models/${id}` },
          { label: t('Document'), link: `/capture-models/${id}/document` },
          { label: t('Structure'), link: `/capture-models/${id}/structure` },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}, {});
