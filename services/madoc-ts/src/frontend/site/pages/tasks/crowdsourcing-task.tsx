import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
import { useContentType } from '@capture-models/plugin-api';
import { CrowdsourcingTask } from '../../../../types/tasks/crowdsourcing-task';
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

const ViewContent: React.FC<{ target: any; canvas: any }> = ({ target, canvas }) => {
  const contentType = useContentType(
    [...target].reverse().map((r: any) => {
      return { ...r, type: r.type.toLowerCase() };
    }),
    {
      height: 600,
      custom: {
        customFetcher: (mid: string) => {
          const canvasTarget = target.find((r: any) => r.type === 'Canvas');
          return {
            '@context': 'http://iiif.io/api/presentation/2/context.json',
            '@id': `${mid}`,
            '@type': 'sc:Manifest',
            sequences: [
              {
                '@id': `${mid}/s1`,
                '@type': 'sc:Sequence',
                canvases: [{ ...canvas.source, '@id': `${canvasTarget.id}` }],
              },
            ],
          };
        },
      },
    }
  );

  return contentType;
};

const ViewCrowdsourcingTask: React.FC<{ task: CrowdsourcingTask }> = ({ task }) => {
  const api = useApi();
  const project = useProjectByTask(task);

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
  }, [api, captureModel]);

  const { data: resource } = useQuery(
    ['cs-canvas', target],
    async () => {
      const primaryTarget = target ? target[0] : undefined;
      if (!primaryTarget || primaryTarget.type !== 'canvas') {
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

    if (!canvas) {
      return;
    }

    if (collection && manifest) {
      return `/collections/${collection.id}/manifests/${manifest.id}/c/${canvas.id}`;
    }
    if (manifest) {
      return `/manifests/${manifest.id}/c/${canvas.id}`;
    }

    return `/canvases/${canvas.id}`;
  }, [target]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <div>
        {backLink ? (
          <div>
            <Link to={backLink}>Back to resource</Link>
          </div>
        ) : null}
        {resource ? <LocaleString as="h1">{resource.canvas.label}</LocaleString> : null}
        <div style={{ display: 'flex' }}>
          {task.status < 3 ? (
            <>
              {captureModel ? (
                <Revisions.Provider captureModel={captureModel}>
                  <div style={{ width: '67%' }}>
                    {resource && resource.canvas ? (
                      <ViewContent target={captureModel.target} canvas={resource.canvas} />
                    ) : null}
                  </div>
                  <div style={{ width: '33%' }}>
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
                </Revisions.Provider>
              ) : (
                'loading...'
              )}
            </>
          ) : (
            <div>
              <h3>Thanks for your submission</h3> <p>Your submission will be reviewed.</p>{' '}
            </div>
          )}
        </div>
        <div style={{ padding: '1px 20px', margin: '20px 0', background: '#eee' }}>
          <Heading3>{task.name}</Heading3>
          <p>{task.description}</p>
          <Status status={task.status} text={task.status_text || ''} isOpen />
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

export default ViewCrowdsourcingTask;
