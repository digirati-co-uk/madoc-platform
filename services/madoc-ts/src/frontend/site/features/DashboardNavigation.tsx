import React from 'react';
import { useTranslation } from 'react-i18next';
import { Subheading1 } from '../../shared/atoms/Heading1';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { HrefLink } from '../../shared/utility/href-link';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const DashboardNavigation: React.FC = () => {
  const { data } = useUserHomepage();
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  const { isSiteAdmin, isSiteContributor } = data;

  return (
    <>
      <Subheading1>{t('Quick navigation')}</Subheading1>
      <LightNavigation role="navigation">
        <LightNavigationItem>
          <HrefLink href={'/projects'}>{t('Projects')}</HrefLink>
        </LightNavigationItem>
        <LightNavigationItem>
          <HrefLink href={'/collections'}>{t('Collections')}</HrefLink>
        </LightNavigationItem>
        {isSiteContributor ? (
          <LightNavigationItem>
            <HrefLink href={'/tasks'}>{t('All tasks')}</HrefLink>
          </LightNavigationItem>
        ) : null}
        <LightNavigationItem>
          <a href={'./profile'}>{t('Manage account')}</a>
        </LightNavigationItem>
        {isSiteAdmin ? (
          <LightNavigationItem>
            <a href={`./madoc/admin`}>{t('Admin')}</a>
          </LightNavigationItem>
        ) : null}
      </LightNavigation>
    </>
  );
};
