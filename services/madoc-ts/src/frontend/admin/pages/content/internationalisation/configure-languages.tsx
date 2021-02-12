import React from 'react';
import { useTranslation } from 'react-i18next';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import * as locale from 'locale-codes';

export const ConfigureLanguages: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Localisation', active: true, link: `/i18n` },
        ]}
        title="Configure languages"
      />
      <WidePage>
        <div>Configure languages. {JSON.stringify(i18n.languages, null, 2)}</div>
        {locale.all.map(item => {
          return (
            <div key={item.tag}>
              {item.name} - {item.location}/{item.local} ({item.tag})
            </div>
          );
        })}
      </WidePage>
    </>
  );
};
