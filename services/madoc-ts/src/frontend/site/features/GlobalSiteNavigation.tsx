import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { HrefLink } from '../../shared/utility/href-link';

export const GlobalSiteNavigation: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();

  return (
    <LightNavigation style={{ marginBottom: 15 }}>
      <LightNavigationItem $active={history.location.pathname === '/projects'}>
        <HrefLink href="/projects">{t('Projects')}</HrefLink>
      </LightNavigationItem>
      <LightNavigationItem $active={history.location.pathname === '/collections'}>
        <HrefLink href="/collections">{t('Collections')}</HrefLink>
      </LightNavigationItem>
    </LightNavigation>
  );
};
