import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

type RouteContext = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
  projectId?: string;
  taskId?: string;
  parentTaskId?: string;
};

export function useRouteContext<T extends RouteContext = RouteContext>(): RouteContext & T {
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
  }, [canvasId, collectionId, manifestId, parentTaskId, slug, taskId]) as any;
}
