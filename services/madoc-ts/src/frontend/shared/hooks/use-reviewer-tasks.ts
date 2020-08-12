import { useUserDetails } from './use-user-details';
import { useQuery } from 'react-query';
import { isReviewer } from '../utility/user-roles';
import { useApi } from './use-api';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';

export function useReviewerTasks(options: { rootTaskId?: string } = {}) {
  const details = useUserDetails();
  const api = useApi();

  const { data } = useQuery(['reviewer-tasks', details?.user.id], async () => {
    if (!details || !details.user) {
      return undefined;
    }

    if (!isReviewer(details)) {
      return undefined;
    }

    return api.getTasks<CrowdsourcingReview>(0, {
      type: 'crowdsourcing-review',
      status: [0, 1, 2],
      all_tasks: true,
      root_task_id: options.rootTaskId,
    });
  });

  return data;
}
