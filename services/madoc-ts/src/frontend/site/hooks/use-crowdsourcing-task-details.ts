import { useMemo } from 'react';
import { SubjectSnippet } from '../../../extensions/tasks/resolvers/subject-resolver';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { resolveUrn } from '../../../utility/resolve-urn';
import { useApi } from '../../shared/hooks/use-api';
import { useApiCaptureModel } from '../../shared/hooks/use-api-capture-model';
import { useProjectByTask } from '../../shared/hooks/use-project-by-task';
import { createLink } from '../../shared/utility/create-link';
import { useTaskMetadata } from './use-task-metadata';

export function useCrowdsourcingTaskDetails(task: CrowdsourcingTask & { id: string }, parentTask?: BaseTask) {
  const project = useProjectByTask(task);
  const api = useApi();
  const { data: captureModel } = useApiCaptureModel(task.parameters[0]);
  const { subject } = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  const date = new Date().getTime();
  const isComplete = task.status === 3;
  const isSubmitted = task.status === 2;
  const wasRejected = task.status === -1;
  const revisionId = task.state.revisionId;
  const mayExpire =
    !isComplete &&
    !wasRejected &&
    !isSubmitted &&
    task.modified_at &&
    task.state.warningTime &&
    date - task.modified_at > task.state.warningTime;
  const changesRequested = task.status !== 3 && task.state?.changesRequested ? task.state?.changesRequested : undefined;
  const rejectedMessage = task.state?.rejectedMessage ? task.state?.rejectedMessage : undefined;

  const target = useMemo(() => {
    if (captureModel && captureModel.target && captureModel.target[0]) {
      return captureModel.target.map(item => resolveUrn(item.id));
    }
    return [];
  }, [api, captureModel]);

  const { editLink, backLink } = useMemo(() => {
    if (!target || !project || project.config.allowCanvasNavigation === false) {
      return {};
    }
    const collection = target.find(item => item && item.type === 'collection');
    const manifest = target.find(item => item && item.type === 'manifest');
    const canvas = target.find(item => item && item.type === 'canvas');

    return {
      editLink: createLink({
        projectId: project?.id,
        canvasId: canvas?.id,
        manifestId: manifest?.id,
        collectionId: collection?.id,
        subRoute: canvas ? 'model' : undefined,
        query: revisionId ? { revision: revisionId } : undefined,
      }),
      backLink: createLink({
        projectId: project?.id,
        canvasId: canvas?.id,
        manifestId: manifest?.id,
        collectionId: collection?.id,
      }),
    };
  }, [revisionId, project, target]);

  const modelId = task.parameters[0];
  const isCanvas =
    parentTask && parentTask.parameters ? parentTask.parameters[2] === 'canvas' : task.parameters[2] === 'canvas';

  return {
    project,
    revisionId,
    modelId,
    isCanvas,
    isComplete,
    isSubmitted,
    changesRequested,
    wasRejected,
    mayExpire,
    backLink,
    editLink,
    target,
    captureModel,
    subject,
    rejectedMessage,
  };
}
