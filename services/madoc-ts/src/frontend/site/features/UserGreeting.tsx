import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading2 } from '../../shared/typography/Heading2';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const UserGreeting: React.FC = () => {
  const { data } = useUserHomepage();
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  return <Heading2 $margin>{t('Welcome back {{user}}', { user: data.userDetails.user.name })}</Heading2>;
};
