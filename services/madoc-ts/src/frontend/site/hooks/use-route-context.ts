import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

export function useRouteContext() {
  const { canvasId, slug, manifestId, collectionId, parentTaskId, taskId } = useParams<{
    collectionId?: string;
    manifestId?: string;
    canvasId?: string;
    slug?: string;
    taskId?: string;
    parentTaskId?: string;
  }>();

  return useMemo(() => {
    return {
      collectionId: collectionId ? Number(collectionId) : undefined,
      manifestId: manifestId ? Number(manifestId) : undefined,
      projectId: slug,
      taskId: taskId,
      parentTaskId,
      canvasId: canvasId ? Number(canvasId) : undefined,
    };
  }, [canvasId, collectionId, manifestId, parentTaskId, slug, taskId]);
}
