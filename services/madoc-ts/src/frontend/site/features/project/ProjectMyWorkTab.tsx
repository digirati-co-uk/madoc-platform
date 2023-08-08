import React from 'react';
import { ProjectContributionButton } from '../../blocks/ProjectContributionButton';
import { Slot } from '../../../shared/page-blocks/slot';
import { ContributionsTasks } from '../userDash/ContributionsTasks';

export const ProjectMyWorkTab: React.FC = () => {
  return (
    <Slot name="my-work-tab-1">
      <ProjectContributionButton />
      <ContributionsTasks />
    </Slot>
  );
};
