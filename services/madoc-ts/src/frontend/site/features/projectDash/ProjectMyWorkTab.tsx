import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectContributionButton } from '../contributor/ProjectContributionButton';
import { Slot } from '../../../shared/page-blocks/slot';

export const ProjectMyWorkTab: React.FC = () => {
  const { t } = useTranslation();
  // dunno if this will work? nested slots seem danger
  return (
    <Slot name="mywork-tab">
      <ProjectContributionButton />
    </Slot>
  );
};
