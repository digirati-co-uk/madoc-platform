import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserDetails } from '../../../shared/hooks/use-user-details';
import { Button } from '../../../shared/navigation/Button';

export const MySites: React.FC = () => {
  const userDetails = useUserDetails();
  const { t } = useTranslation();
  const sites = userDetails?.sites || [];

  return (
    <>
      {sites.map(site => {
        return (
          <div key={site.slug}>
            <h3>{site.title}</h3>
            <Button $primary as={'a'} href={`/s/${site.slug}`}>
              {t('Go to site')}
            </Button>
          </div>
        );
      })}
    </>
  );
};
