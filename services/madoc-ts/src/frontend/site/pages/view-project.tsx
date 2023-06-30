import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { ProjectActions } from '../features/contributor/ProjectActions';
import { ProjectContributors } from '../features/ProjectContributors';
import { ProjectHeading } from '../features/ProjectHeading';
import { ProjectStatistics } from '../features/ProjectStatistics';
import { ProjectTabs } from '../features/projectDash/ProjectTabs';

export const ViewProject: React.FC = () => {
  const available = (
    <AvailableBlocks>
      <ProjectContributors />
    </AvailableBlocks>
  );

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="project-heading">
        <ProjectStatus />
        <ProjectHeading />
        {available}
      </Slot>

      <Slot name="project-actions">
        <ProjectActions />
        <ProjectStatistics />
        {available}
      </Slot>

      <Slot name="project-navigation">
        <ProjectTabs />
        {available}
      </Slot>
    </>
  );
};
