import { useQueryCache } from 'react-query';
import { ProjectFull } from '../../../types/project-full';
import { ProjectUpdate } from '../../../types/projects';
import { Pagination } from '../../../types/schemas/_pagination';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useRouteContext } from './use-route-context';

interface ProjectUpdateList {
  pagination: Pagination;
  updates: ProjectUpdate[];
}

export function useProjectUpdatesCache() {
  const queryCache = useQueryCache();
  const { projectId } = useRouteContext();
  const { page = 1 } = useLocationQuery<{ page?: string | number }>();
  const currentPage = Number(page);
  const listKey = ['site-project-update-list', { projectId, page }];
  const projectKey = ['getSiteProject', [projectId]];

  const setList = (updates: ProjectUpdate[], totalResults: number) => {
    const current = queryCache.getQueryData<ProjectUpdateList>(listKey);
    if (!current) {
      return;
    }

    queryCache.setQueryData<ProjectUpdateList>(listKey, {
      ...current,
      updates,
      pagination: {
        ...current.pagination,
        totalResults,
        totalPages: Math.ceil(totalResults / 10),
      },
    });
  };

  const setLatest = (latestUpdate: ProjectUpdate | null) => {
    const current = queryCache.getQueryData<ProjectFull>(projectKey);
    if (current) {
      queryCache.setQueryData<ProjectFull>(projectKey, { ...current, latestUpdate });
    }
  };

  return {
    created(update: ProjectUpdate) {
      const current = queryCache.getQueryData<ProjectUpdateList>(listKey);
      if (current) {
        const updates = currentPage === 1 ? [update, ...current.updates].slice(0, 10) : current.updates;
        setList(updates, current.pagination.totalResults + 1);
      }
      setLatest(update);
    },
    updated(update: ProjectUpdate) {
      const current = queryCache.getQueryData<ProjectUpdateList>(listKey);
      if (current) {
        setList(
          current.updates.map(item => (item.id === update.id ? update : item)),
          current.pagination.totalResults
        );
      }

      const project = queryCache.getQueryData<ProjectFull>(projectKey);
      if (project?.latestUpdate?.id === update.id) {
        setLatest(update);
      }
    },
    deleted(updateId: number) {
      const current = queryCache.getQueryData<ProjectUpdateList>(listKey);
      const updates = current?.updates.filter(update => update.id !== updateId) || [];
      if (current) {
        setList(updates, Math.max(0, current.pagination.totalResults - 1));
      }

      const project = queryCache.getQueryData<ProjectFull>(projectKey);
      if (project?.latestUpdate?.id === updateId) {
        setLatest(currentPage === 1 ? updates[0] || null : null);
      }
    },
  };
}
