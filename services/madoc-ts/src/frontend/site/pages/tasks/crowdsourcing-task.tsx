import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@capture-models/editor';
import { useApi } from '../../../shared/hooks/use-api';
import { Link } from 'react-router-dom';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { queryCache } from 'react-query';
import '@capture-models/editor/lib/input-types/TextField';
import '@capture-models/editor/lib/input-types/HTMLField';
import { useApiCanvas } from '../../../shared/hooks/use-api-canvas';
import { useApiCaptureModel } from '../../../shared/hooks/use-api-capture-model';
import { useProjectByTask } from '../../../shared/hooks/use-project-by-task';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { TaskContext } from '../loaders/task-loader';
import { createLink } from '../../../shared/utility/create-link';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { CaptureModelViewer } from '../../../shared/viewers/caputre-model-viewer';
import { CrowdsourcingTaskManifest } from './crowdsourcing-task-manifest';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task, parentTask }) => {
  const api = useApi();
  const project = useProjectByTask(task);
  const { t } = useTranslation();

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

  const { data: captureModel } = useApiCaptureModel(task.parameters[0]);

  const target = useMemo(() => {
    if (captureModel && captureModel.target && captureModel.target[0]) {
      return captureModel.target.map(item => api.resolveUrn(item.id));
    }
    return [];
  }, [api, captureModel]);

  const primaryTarget = useMemo(
    () => (captureModel ? target.find((t: any) => t.type.toLowerCase() === 'canvas') : undefined),
    [captureModel, target]
  );

  const { data: resource } = useApiCanvas(primaryTarget?.id);

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

  const modelId = task.parameters[0];
  const isCanvas = parentTask ? parentTask.parameters[2] === 'canvas' : task.parameters[2] === 'canvas';

  if (!isCanvas) {
    return (
      <CrowdsourcingTaskManifest
        task={parentTask ? parentTask : task}
        subtask={parentTask ? task : undefined}
        projectId={project?.slug}
      />
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <div>
        {backLink ? (
          <div>
            <Link to={backLink}>{t('Back to resource')}</Link>
          </div>
        ) : null}
        {resource ? <LocaleString as="h1">{resource.canvas.label}</LocaleString> : null}
        {task.status !== 3 && task.state?.changesRequested ? (
          <div style={{ background: 'lightblue', padding: '1em', marginBottom: '1em' }}>
            <Heading3>{t('The following changes were requested')}</Heading3>
            <p>{task.state.changesRequested}</p>
          </div>
        ) : null}
        {mayExpire ? <WarningMessage>{t('Your contribution may expire soon')}</WarningMessage> : null}
        {isComplete ? (
          <WarningMessage>
            {t('This task is complete, you can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
          </WarningMessage>
        ) : null}
        {wasRejected ? (
          <ErrorMessage>
            {t('This contribution was rejected , you can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
          </ErrorMessage>
        ) : null}
        {isSubmitted ? <WarningMessage>{t('Your submission is in review')}</WarningMessage> : null}
        {resource && captureModel && modelId ? (
          <CaptureModelViewer
            modelId={modelId}
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
              await queryCache.invalidateQueries(['task', { id: task.id }]);
            }}
          />
        ) : null}
      </div>
    </ThemeProvider>
  );
};

export default ViewCrowdSourcingTask;
