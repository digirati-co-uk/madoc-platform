import React from 'react';
import { useTranslation } from 'react-i18next';
import { TinyButton } from '../../shared/navigation/Button';
import { Heading3 } from '../../shared/typography/Heading3';
import { ProjectListing } from '../../shared/atoms/ProjectListing';
import { HrefLink } from '../../shared/utility/href-link';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const UserProjects: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useUserHomepage();

  if (!data || !data.projects) {
    return null;
  }

  return (
    <>
      <Heading3 $margin>{t('Active projects')}</Heading3>
      <ProjectListing projects={data.projects} showLink />
      <div style={{ marginTop: 20 }}>
        <TinyButton as={HrefLink} href={`/projects`}>
          {t('Browse all projects')}
        </TinyButton>
      </div>
    </>
  );
};
