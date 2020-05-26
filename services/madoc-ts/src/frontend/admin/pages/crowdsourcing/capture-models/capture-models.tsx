import React from 'react';
import { renderUniversalRoutes } from '../../../server-utils';
import { useTranslation } from 'react-i18next';
import { createUniversalComponent } from '../../../utility';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../atoms/WidePage';

export const CaptureModels = createUniversalComponent(({ route }) => {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Capture models'), link: '/capture-models', active: true },
        ]}
        title="Capture models"
      />
      <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
    </>
  );
}, {});
