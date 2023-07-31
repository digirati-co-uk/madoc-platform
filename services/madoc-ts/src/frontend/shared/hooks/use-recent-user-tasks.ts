import { parseUrn } from '../../../utility/parse-urn';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { useProject } from '../../site/hooks/use-project';
import { firstNTasksWithUniqueSubjects } from '../utility/first-n-tasks-with-unique-subjects';
import { useContributorTasks } from './use-contributor-tasks';

export function useRecentUserTasks(requested = 3, fallbackOnly = false) {
  const { data: project } = useProject();
  const {
    project: { contributionMode, claimGranularity },
  } = useSiteConfiguration();
  const contributorTasks = useContributorTasks({ rootTaskId: project?.task_id }, !!project);

  const currentTasks = contributorTasks?.drafts.tasks;
  const tasksInReview = contributorTasks?.reviews.tasks;

  const firstThree = currentTasks && currentTasks.length ? firstNTasksWithUniqueSubjects(currentTasks, requested) : [];

  const tasksToReturn = firstThree.map(task => {
    return {
      task,
      next: false,
    };
  });

  if (tasksToReturn.length && fallbackOnly) {
    return tasksToReturn;
  }

  if (
    contributionMode !== 'transcription' &&
    claimGranularity !== 'manifest' &&
    tasksInReview &&
    tasksInReview.length &&
    firstThree.length < requested
  ) {
    const firstThreeReviews = firstNTasksWithUniqueSubjects(tasksInReview, requested - firstThree.length);

    for (const task of firstThreeReviews) {
      const parsed = parseUrn(task.subject);
      if (parsed && parsed.type === 'canvas') {
        tasksToReturn.push({ task, next: true });
      }
    }
  }

  return tasksToReturn;
}
