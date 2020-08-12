import { useUserDetails } from './use-user-details';
import { useQuery } from 'react-query';
import { isContributor } from '../utility/user-roles';
import { useApi } from './use-api';
import { CrowdsourcingTask } from '../../../types/tasks/crowdsourcing-task';

export function useContributorTasks(options: { rootTaskId?: string } = {}) {
  const details = useUserDetails();
  const api = useApi();

  const { data } = useQuery(['contributor-tasks', details?.user.id], async () => {
    if (!details || !details.user) {
      return undefined;
    }

    if (!isContributor(details)) {
      return undefined;
    }

    return {
      drafts: await api.getTasks<CrowdsourcingTask>(0, {
        type: 'crowdsourcing-task',
        status: [0, 1],
        all_tasks: true,
        root_task_id: options.rootTaskId,
      }),
      reviews: await api.getTasks<CrowdsourcingTask>(0, {
        type: 'crowdsourcing-task',
        status: 2,
        all_tasks: true,
        root_task_id: options.rootTaskId,
      }),
    };
  });

  return data;
}
