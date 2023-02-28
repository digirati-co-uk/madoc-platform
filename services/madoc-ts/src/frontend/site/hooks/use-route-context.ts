import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSlots } from '../../shared/page-blocks/slot-context';

export type RouteContext = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
  projectId?: string;
  taskId?: string;
  parentTaskId?: string;
  topicType?: string;
  topic?: string;
};

export function useRouteContext<T extends RouteContext = RouteContext>(): RouteContext & T {
  const { context } = useSlots();
  const { canvasId, slug, manifestId, collectionId, parentTaskId, taskId, topicType, topic } = useParams<{
    collectionId?: string;
    manifestId?: string;
    canvasId?: string;
    slug?: string;
    taskId?: string;
    parentTaskId?: string;
    topicType?: string;
    topic?: string;
  }>();

  return useMemo(() => {
    return {
      collectionId: collectionId ? Number(collectionId) : context.collection,
      manifestId: manifestId ? Number(manifestId) : context.manifest,
      projectId: slug || context.project,
      taskId: taskId,
      parentTaskId,
      canvasId: canvasId ? Number(canvasId) : context.canvas,
      topicType: topicType ? topicType : context.topicType,
      topic: topic ? topic : context.topic,
    };
  }, [context, canvasId, collectionId, manifestId, parentTaskId, topicType, topic, slug, taskId]) as any;
}
