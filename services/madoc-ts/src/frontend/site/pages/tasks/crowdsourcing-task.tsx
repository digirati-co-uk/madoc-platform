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
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../../../shared/atoms/EditorToolbar';
import { ArrowBackIcon } from '../../../shared/icons/ArrowBackIcon';
import { HrefLink } from '../../../shared/utility/href-link';
import { PreviewIcon } from '../../../shared/icons/PreviewIcon';
import { EditIcon } from '../../../shared/icons/EditIcon';
import { MaximiseWindow } from '../../../shared/atoms/MaximiseWindow';
import { FullScreenExitIcon } from '../../../shared/icons/FullScreenExitIcon';
import { FullScreenEnterIcon } from '../../../shared/icons/FullScreenEnterIcon';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task }) => {
  const api = useApi();
  const project = useProjectByTask(task);
  const [isVertical, setIsVertical] = useState(false);

  const isComplete = task.status === 3;
  const isSubmitted = task.status === 2;
  const wasRejected = task.status === -1;

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

        {task.status !== 3 && task.state?.changesRequested ? (
          <div style={{ background: 'lightblue', padding: '1em', marginBottom: '1em' }}>
            <Heading3>The following changes were requested</Heading3>
            <p>{task.state.changesRequested}</p>
          </div>
        ) : null}

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

        <MaximiseWindow>
          {({ toggle, isOpen }) =>
            captureModel ? (
              <Revisions.Provider captureModel={captureModel}>
                <EditorToolbarContainer>
                  <EditorToolbarButton as={HrefLink} href={backLink}>
                    <EditorToolbarIcon>
                      <ArrowBackIcon />
                    </EditorToolbarIcon>
                  </EditorToolbarButton>
                  <EditorToolbarTitle>
                    <CaptureModelHeader />
                  </EditorToolbarTitle>
                  <EditorToolbarSpacer />

                  <EditorToolbarButton onClick={() => setIsVertical(r => !r)}>
                    <EditorToolbarIcon>
                      <PreviewIcon />
                    </EditorToolbarIcon>
                    <EditorToolbarLabel>Switch layout</EditorToolbarLabel>
                  </EditorToolbarButton>
                  <EditorToolbarButton onClick={toggle}>
                    <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
                  </EditorToolbarButton>
                </EditorToolbarContainer>
                <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
                  <div style={{ width: isVertical ? '100%' : '67%' }}>
                    {resource && resource.canvas ? (
                      <ViewContent
                        key={`${isVertical ? 'y' : 'n'}${isOpen ? 'y' : 'n'}`}
                        target={captureModel.target as any}
                        canvas={resource.canvas}
                      />
                    ) : null}
                  </div>
                  <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
                    <CaptureModelEditor
                      readOnly={isComplete || wasRejected || isSubmitted}
                      allowEdits={!isComplete && !wasRejected && !isSubmitted}
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
                </div>
              </Revisions.Provider>
            ) : (
              'loading...'
            )
          }
        </MaximiseWindow>
      </div>
    </ThemeProvider>
  );
};

export default ViewCrowdSourcingTask;
