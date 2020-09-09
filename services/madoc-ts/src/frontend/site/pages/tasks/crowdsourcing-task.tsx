import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@capture-models/editor';
import { useApi } from '../../../shared/hooks/use-api';
import { Link } from 'react-router-dom';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { queryCache } from 'react-query';
import '@capture-models/editor/lib/input-types/TextField';
import '@capture-models/editor/lib/input-types/HTMLField';
import { useProjectByTask } from '../../../shared/hooks/use-project-by-task';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { TaskContext } from '../loaders/task-loader';
import { createLink } from '../../../shared/utility/create-link';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { CaptureModelViewer } from '../../../shared/viewers/caputre-model-viewer';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task }) => {
  const api = useApi();
  const project = useProjectByTask(task);

  const date = new Date().getTime();

  const isComplete = task.status === 3;
  const isSubmitted = task.status === 2;
  const wasRejected = task.status === -1;
  const mayExpire =
    !isComplete &&
    !wasRejected &&
    !isSubmitted &&
    task.modified_at &&
    task.state.warningTime &&
    date - task.modified_at > task.state.warningTime;

  const { data: captureModel } = useQuery(
    ['capture-model', { id: task.parameters[0] }],
    async () => {
      return api.getCaptureModel(task.parameters[0]);
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );

  const target = useMemo(() => {
    if (captureModel && captureModel.target && captureModel.target[0]) {
      return captureModel.target.map(item => api.resolveUrn(item.id));
    }
    return [];
  }, [api, captureModel]);

  const { data: resource } = useQuery(
    ['cs-canvas', target],
    async () => {
      const primaryTarget = captureModel ? target.find((t: any) => t.type.toLowerCase() === 'canvas') : undefined;

      if (!primaryTarget) {
        return;
      }

      return api.getSiteCanvas(primaryTarget.id);
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );

  const backLink = useMemo(() => {
    if (!target || !project || project.config.allowCanvasNavigation === false) {
      return;
    }
    const collection = target.find(item => item && item.type === 'collection');
    const manifest = target.find(item => item && item.type === 'manifest');
    const canvas = target.find(item => item && item.type === 'canvas');

    return createLink({
      projectId: project?.id,
      canvasId: canvas?.id,
      manifestId: manifest?.id,
      collectionId: collection?.id,
    });
  }, [project, target]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <div>
        {backLink ? (
          <div>
            <Link to={backLink}>Back to resource</Link>
          </div>
        ) : null}
        {resource ? <LocaleString as="h1">{resource.canvas.label}</LocaleString> : null}
        {task.status !== 3 && task.state?.changesRequested ? (
          <div style={{ background: 'lightblue', padding: '1em', marginBottom: '1em' }}>
            <Heading3>The following changes were requested</Heading3>
            <p>{task.state.changesRequested}</p>
          </div>
        ) : null}
        {mayExpire ? <WarningMessage>Your contribution may expire soon</WarningMessage> : null}
        {isComplete ? (
          <WarningMessage>
            This task is complete, you can make another contribution from the{' '}
            {backLink ? <Link to={backLink}>Image page</Link> : 'Image page'}
          </WarningMessage>
        ) : null}
        {wasRejected ? (
          <ErrorMessage>
            This contribution was rejected , you can make another contribution from the{' '}
            {backLink ? <Link to={backLink}>Image page</Link> : 'Image page'}
          </ErrorMessage>
        ) : null}
        {isSubmitted ? <WarningMessage>Your submissions is in review.</WarningMessage> : null}
        <CaptureModelViewer
          modelId={task.parameters[0]}
          revisionId={task.state.revisionId}
          onSave={async (response, status) => {
            if (!task.id || !project) return;

            if (status === 'draft') {
              await api.saveResourceClaim(project.id, task.id, {
                status: 1,
                revisionId: response.revision.id,
              });
            } else if (status === 'submitted') {
              await api.saveResourceClaim(project.id, task.id, {
                status: 2,
                revisionId: response.revision.id,
              });
            }
            await queryCache.refetchQueries(['task', { id: task.id }]);
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default ViewCrowdSourcingTask;
