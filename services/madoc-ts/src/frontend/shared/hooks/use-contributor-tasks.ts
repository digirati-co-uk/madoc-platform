import { useUserDetails } from './use-user-details';
import { useQuery } from 'react-query';
import { isContributor } from '../utility/user-roles';
import { useApi } from './use-api';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';

export function useContributorTasks(options: { rootTaskId?: string } = {}, enabled = true) {
  const details = useUserDetails();
  const api = useApi();

  const { data, clear } = useQuery(
    ['contributor-tasks', { user: details?.user.id, rootTaskId: options.rootTaskId }],
    async () => {
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
          assignee: `urn:madoc:user:${details.user.id}`,
          detail: true,
          per_page: 10,
          sort_by: 'newest',
        }),
        reviews: await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: 2,
          all_tasks: true,
          root_task_id: options.rootTaskId,
          detail: true,
          assignee: `urn:madoc:user:${details.user.id}`,
          per_page: 10,
          sort_by: 'newest',
        }),
      };
    },
    { enabled, refetchOnMount: 'always' }
  );

  // useEffect(() => {
  //   clear();
  // }, [clear, options.rootTaskId]);

  return data;
}
