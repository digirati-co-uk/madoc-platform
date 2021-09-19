import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1, Subheading1 } from '../../shared/typography/Heading1';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { ContributorTasks } from '../../shared/components/ContributorTasks';
import { LocaleString } from '../../shared/components/LocaleString';
import { ReviewerTasks } from '../../shared/components/ReviewerTasks';
import { useContributorTasks } from '../../shared/hooks/use-contributor-tasks';
import { useReviewerTasks } from '../../shared/hooks/use-reviewer-tasks';
import { useProject } from '../hooks/use-project';

export const ViewProjectTasks: React.FC = () => {
  const { t } = useTranslation();
  const { data: project } = useProject();

  const contributorTasks = useContributorTasks({ rootTaskId: project?.task_id }, !!project);
  const reviewerTasks = useReviewerTasks({ rootTaskId: project?.task_id }, !!project);

  if (!project) {
    return null;
  }

  return (
    <>
      <DisplayBreadcrumbs currentPage={t('Project tasks')} />

      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>

      {reviewerTasks ? (
        <ReviewerTasks reviews={reviewerTasks} projectId={project.slug} rootTaskId={project.task_id} />
      ) : null}
      {contributorTasks ? (
        <ContributorTasks
          drafts={contributorTasks.drafts}
          reviews={contributorTasks.reviews}
          projectId={project.slug}
          rootTaskId={project.task_id}
        />
      ) : null}
    </>
  );
};
