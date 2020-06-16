import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { defaultTheme, Revisions } from '@capture-models/editor';
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

const ViewCrowdsourcingTask: React.FC<{ task: CrowdsourcingTask }> = ({ task }) => {
  const api = useApi();

  const { data: captureModel, refetch } = useQuery(
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

  const { data: resource } = useQuery(['cs-canvas', target], async () => {
    const primaryTarget = target ? target[0] : undefined;
    if (!primaryTarget || primaryTarget.type !== 'canvas') {
      return;
    }

    return api.getSiteCanvas(primaryTarget.id);
  });

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
    <div>
      {backLink ? (
        <div>
          <Link to={backLink}>Back to resource</Link>
        </div>
      ) : null}
      <div style={{ padding: '1px 20px', margin: '20px 0', background: '#eee' }}>
        <Heading3>{task.name}</Heading3>
        <p>{task.description}</p>
        <Status status={task.status} text={task.status_text || ''} isOpen />
      </div>
      {resource ? <LocaleString as="h1">{resource.canvas.label}</LocaleString> : null}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '60%' }}>{resource ? <img src={resource.canvas.thumbnail} /> : null}</div>
        <div style={{ width: '40%' }}>
          {task.status < 3 ? (
            <ThemeProvider theme={defaultTheme}>
              {captureModel ? (
                <Revisions.Provider captureModel={captureModel}>
                  <CaptureModelEditor
                    captureModel={captureModel}
                    onSave={async (response, status) => {
                      if (status === 'draft') {
                        await api.updateTask(task.id, { status: 2, status_text: 'in progress' });
                      } else if (status === 'submitted') {
                        await api.updateTask(task.id, { status: 3, status_text: 'submitted' });
                      }
                      await queryCache.refetchQueries(['task', { id: task.id }]);
                    }}
                  />
                </Revisions.Provider>
              ) : (
                'loading...'
              )}
            </ThemeProvider>
          ) : (
            <div>
              <h3>Thanks for your submission</h3> <p>Your submission will be reviewed.</p>{' '}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCrowdsourcingTask;
