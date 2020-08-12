import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
import { useApi } from '../../../shared/hooks/use-api';
import { CaptureModelEditor } from '../../../shared/caputre-models/CaptureModelEditor';
import { Link } from 'react-router-dom';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Status } from '../../../shared/atoms/Status';
import { Heading3 } from '../../../shared/atoms/Heading3';
import { queryCache } from 'react-query';
import '@capture-models/editor/lib/input-types/TextField';
import '@capture-models/editor/lib/input-types/HTMLField';
import { useProjectByTask } from '../../../shared/hooks/use-project-by-task';
import { Button } from '../../../shared/atoms/Button';
import { CaptureModelHeader } from '../../../shared/caputre-models/CaptureModelHeader';
import { ViewContent } from '../../../shared/components/ViewContent';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
import { TaskContext } from '../loaders/task-loader';
import { createLink } from '../../../shared/utility/create-link';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task }) => {
  const api = useApi();
  const project = useProjectByTask(task);
  const [isVertical, setIsVertical] = useState(false);

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
    if (!target) {
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

        {captureModel ? (
          <Revisions.Provider captureModel={captureModel}>
            <CaptureModelHeader />
            <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
              {task.status < 3 ? (
                <>
                  <div style={{ width: isVertical ? '100%' : '67%' }}>
                    {resource && resource.canvas ? (
                      <ViewContent target={captureModel.target as any} canvas={resource.canvas} />
                    ) : null}
                  </div>
                  <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
                    <CaptureModelEditor
                      captureModel={captureModel}
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
                </>
              ) : (
                <div>
                  <h3>Thanks for your submission</h3> <p>Your submission will be reviewed.</p>{' '}
                </div>
              )}
            </div>
          </Revisions.Provider>
        ) : (
          'loading...'
        )}
        <Button onClick={() => setIsVertical(v => !v)}>Switch layout</Button>
        <div style={{ padding: '1px 20px', margin: '20px 0', background: '#eee' }}>
          <Heading3>{task.name}</Heading3>
          <p>{task.description}</p>
          <Status status={task.status} text={task.status_text || ''} />
          {project ? (
            <div>
              <Link to={`/projects/${project.id}`}>
                <LocaleString as="h4">{project.label}</LocaleString>
              </Link>
              <LocaleString as="p">{project.summary}</LocaleString>
            </div>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ViewCrowdSourcingTask;
