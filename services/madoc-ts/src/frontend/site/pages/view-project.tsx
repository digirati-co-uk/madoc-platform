import React from 'react';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { ProjectActions } from '../blocks/ProjectActions';
import { ProjectContributors } from '../blocks/ProjectContributors';
import { ProjectHeading } from '../blocks/ProjectHeading';
import { ProjectStatistics } from '../blocks/ProjectStatistics';
import { ProjectTabs } from '../blocks/ProjectTabs';
import { SearchResource } from '../blocks/SearchResource';

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

      <Slot name="project-actionss">
        <SearchResource />
        <ProjectStatistics />
        <ProjectActions />
        {available}
      </Slot>

      <Slot name="project-navigation">
        <ProjectTabs />
        {available}
      </Slot>
    </>
  );
};
