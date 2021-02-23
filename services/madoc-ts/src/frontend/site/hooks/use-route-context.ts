import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSlots } from '../../shared/page-blocks/slot-context';

type RouteContext = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
  projectId?: string;
  taskId?: string;
  parentTaskId?: string;
};

export function useRouteContext<T extends RouteContext = RouteContext>(): RouteContext & T {
  const { context } = useSlots();
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
      collectionId: collectionId ? Number(collectionId) : context.collection,
      manifestId: manifestId ? Number(manifestId) : context.manifest,
      projectId: slug || context.project,
      taskId: taskId,
      parentTaskId,
      canvasId: canvasId ? Number(canvasId) : context.canvas,
    };
  }, [context, canvasId, collectionId, manifestId, parentTaskId, slug, taskId]) as any;
}
