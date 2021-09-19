import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../shared/atoms/MetadataConfiguration';
import { Heading1 } from '../../shared/typography/Heading1';

export const PageNotFound: React.FC = () => {
  const { t } = useTranslation();
  return (
    <MetadataEmptyState>
      <Heading1>{t('Page not found')}</Heading1>
    </MetadataEmptyState>
  );
};
