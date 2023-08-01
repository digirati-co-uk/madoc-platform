import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { useUser } from '../../shared/hooks/use-site';
import { SlotTabs } from '../../tailwind/components/slot-tabs';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';

import { MostRecentProjectUpdate } from '../../tailwind/blocks/project/MostRecentProjectUpdate';
import { PostNewProjectUpdate } from '../../tailwind/blocks/project/PostNewProjectUpdate';
import { ProjectBanner } from '../../tailwind/blocks/project/ProjectBanner';
import { ProjectContinueSubmissions } from '../../tailwind/blocks/project/ProjectContinueSubmissions';
import { ProjectFeedback } from '../../tailwind/blocks/project/ProjectFeedback';
import { ProjectFeedbackListing } from '../../tailwind/blocks/project/ProjectFeedbackListing';
import { ProjectManifestList } from '../../tailwind/blocks/project/ProjectManifestList';
import { ProjectMyWork } from '../../tailwind/blocks/project/ProjectMyWork';
import { ProjectPersonalNotes } from '../../tailwind/blocks/project/ProjectPersonalNotes';
import { ProjectSearchBox } from '../../tailwind/blocks/project/ProjectSearchBox';
import { ProjectActions } from '../blocks/ProjectActions';
import { ProjectCollections } from '../blocks/ProjectCollections';
import { ProjectContributionButton } from '../blocks/ProjectContributionButton';
import { ProjectContributors } from '../blocks/ProjectContributors';
import { ProjectHeading } from '../blocks/ProjectHeading';
import { ProjectStatistics } from '../blocks/ProjectStatistics';
import { useProject } from '../hooks/use-project';
import { ListProjectUpdates } from '../../tailwind/blocks/project/ListProjectUpdates';

export const ViewProject: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const { data: project } = useProject();
  const available = (
    <AvailableBlocks>
      <ProjectContributors />
      <ProjectContributionButton />
      <ProjectHeading />
    </AvailableBlocks>
  );

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="project-heading">
        <ProjectStatus />
        <ProjectBanner />
        <ProjectSearchBox />
        {available}
      </Slot>

      <Slot name="project-actions">
        <ProjectStatistics />
        <ProjectActions />
        {available}
      </Slot>

      <SlotTabs initial={project?.isProjectMember ? 'project-my-work' : 'project-content'}>
        <Slot name="project-navigation" label={t('Overview')}>
          <MostRecentProjectUpdate />
        </Slot>
        <Slot name="project-my-work" label={t('My work')} hidden={!user}>
          <ProjectContinueSubmissions />
          <ProjectMyWork />
          <ProjectPersonalNotes />
        </Slot>
        <Slot name="project-content" label={t('Manifests and Collections')}>
          <ProjectCollections />
          <ProjectManifestList />
          {available}
        </Slot>
        <Slot name="project-contributors" label={t('Contributors')} />
        <Slot name="project-updates" label={t('Updates')}>
          <ListProjectUpdates />
          <PostNewProjectUpdate />
        </Slot>
        <Slot name="project-feedback" label={t('Feedback')} hidden={project?.isProjectMember !== true}>
          <ProjectFeedbackListing />
          <ProjectFeedback />
        </Slot>
      </SlotTabs>
    </>
  );
};
