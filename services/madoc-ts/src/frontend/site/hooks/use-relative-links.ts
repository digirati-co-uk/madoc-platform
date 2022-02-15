import { useCallback } from 'react';
import { createLink } from '../../shared/utility/create-link';
import { useRouteContext } from './use-route-context';

export function useRelativeLinks() {
  const { canvasId, taskId, manifestId, parentTaskId, collectionId, projectId } = useRouteContext();

  return useCallback(
    (
      opts: {
        projectId?: string | number;
        collectionId?: string | number;
        manifestId?: string | number;
        canvasId?: string | number;
        taskId?: string;
        parentTaskId?: string;
        query?: any;
        subRoute?: string;
        admin?: boolean;
        hash?: string;
      } = {}
    ) => {
      return createLink({
        projectId,
        collectionId,
        manifestId,
        taskId,
        parentTaskId,
        canvasId,
        ...opts,
      });
    },
    [canvasId, collectionId, manifestId, parentTaskId, projectId, taskId]
  );
}
