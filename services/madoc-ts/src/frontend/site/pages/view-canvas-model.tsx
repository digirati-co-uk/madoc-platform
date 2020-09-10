import { CrowdsourcingManifestTask } from '../../../gateway/tasks/crowdsourcing-manifest-task';
import { CanvasFull } from '../../../types/schemas/canvas-full';
import { ProjectFull } from '../../../types/schemas/project-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LockIcon } from '../../shared/atoms/LockIcon';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { CanvasNavigation } from '../../shared/components/CanvasNavigation';
import { LocaleString } from '../../shared/components/LocaleString';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import React from 'react';
import { useData } from '../../shared/hooks/use-data';
import { CaptureModelViewer } from '../../shared/viewers/caputre-model-viewer';
import { useApi } from '../../shared/hooks/use-api';
import { PreModelViewer } from '../../shared/viewers/pre-model-viewer';
import { useMutation } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';
import { createLink } from '../../shared/utility/create-link';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { Status } from '../../shared/atoms/Status';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { RevisionRequest } from '@capture-models/types';
import { WarningMessage } from '../../shared/atoms/WarningMessage';
import { CrowdsourcingCanvasTask } from '../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { HrefLink } from '../../shared/utility/href-link';
import { SmallButton } from '../../shared/atoms/Button';
import { CanvasLoaderType } from './loaders/canvas-loader';

type ViewCanvasModelProps = CanvasLoaderType['data'] & CanvasLoaderType['context'];

type ViewCanvasModelType = {
  params: {
    slug?: string; // project
    collectionId?: string;
    manifestId?: string;
    id: string;
  };
  query: {};
  variables: {
    slug?: string;
    collectionId?: number;
    manifestId?: number;
    id: number;
  };
  data: {
    canvas: CanvasFull;
    canvasTask?: CrowdsourcingCanvasTask;
    manifestTask?: CrowdsourcingTask | CrowdsourcingManifestTask;
    userTasks?: CrowdsourcingTask[];
    canUserSubmit: boolean;
    model?: {
      model: {
        id: string;
      } | null;
    };
  };
  context: {
    project?: ProjectFull;
    manifest: ManifestFull['manifest'];
  };
};

const SubmissionDetails: React.FC<{
  canvasTask: CrowdsourcingCanvasTask;
  userTasks?: CrowdsourcingTask[];
  refresh: () => Promise<void>;
  backLink: string;
}> = ({ canvasTask, backLink, userTasks, refresh }) => {
  // @todo use the canvas task to show a status on this page.
  // @todo use the published model to show annotations to end users.
  const api = useApi();
  const date = new Date().getTime();
  const history = useHistory();
  const found = userTasks
    ? userTasks.find(task => {
        if (!task.state.warningTime || !task.modified_at) return;
        return date - task.modified_at > task.state.warningTime && task.status === 1;
      })
    : undefined;

  const [abandonTask, abandonResponse] = useMutation(async (task: CrowdsourcingTask) => {
    if (task.status !== 3 && task.status !== 2 && task.status !== -1) {
      await api.updateTask(task.id, {
        status: -1,
        status_text: 'Abandoned',
      });
      await refresh();
      history.push(backLink);
    }
  });

  return (
    <>
      {found ? (
        <WarningMessage>
          {userTasks?.length ? 'Your contribution may expire' : 'Some of your contributions may expire'}
        </WarningMessage>
      ) : null}
      {userTasks && userTasks.length ? (
        <TableContainer>
          {userTasks.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel>{task.name}</TableRowLabel>
              <TableRowLabel>{task.state.changesRequested}</TableRowLabel>
              <TableRowLabel>{task.state.changesRequested}</TableRowLabel>
              <TableRowLabel>
                <strong>
                  {task.modified_at && task.state.warningTime && date - task.modified_at > task.state.warningTime
                    ? 'expires soon'
                    : null}
                </strong>
              </TableRowLabel>
              <TableActions>
                {task.status !== 3 && task.status !== 2 && task.status !== -1 && task.type === 'crowdsourcing-task' ? (
                  <SmallButton disabled={abandonResponse.status === 'loading'} onClick={() => abandonTask(task)}>
                    Abandon
                  </SmallButton>
                ) : null}
              </TableActions>
            </TableRow>
          ))}
        </TableContainer>
      ) : null}
    </>
  );
};

export const ViewCanvasModel: React.FC<ViewCanvasModelProps> = ({
  project,
  refetch,
  canvas,
  manifest,
  canUserSubmit,
  manifestTask,
  userTasks,
  canvasTask,
  model,
  manifestUserTasks,
}) => {
  const api = useApi();
  const { slug, collectionId, manifestId, id } = useParams<{
    id: string;
    manifestId?: string;
    collectionId?: string;
    slug?: string;
  }>();
  const { revision } = useLocationQuery();
  const preventCanvasNavigation = project && project.config.allowCanvasNavigation === false;
  const user = api.getIsServer() ? undefined : api.getCurrentUser();
  const bypassCanvasNavigation = user
    ? user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.revision') !== -1
    : manifestUserTasks && manifestUserTasks.length > 0;

  const [prepareContribution] = useMutation(async () => {
    if (project && id) {
      await api.prepareResourceClaim(project.id, {
        canvasId: Number(id),
        manifestId: manifestId ? Number(manifestId) : undefined,
        collectionId: collectionId ? Number(collectionId) : undefined,
      });
      await refetch();
    }
  });

  const completedAndHide = project?.config.allowSubmissionsWhenCanvasComplete === false && canvasTask?.status === 3;

  const backLink = createLink({
    canvasId: id,
    projectId: slug,
    manifestId,
    collectionId,
  });

  if (!canUserSubmit) {
    return (
      <div>
        <DisplayBreadcrumbs />
        <h1>Maximum number of contributors reached</h1>
        <HrefLink href={backLink}>Go back to resource</HrefLink>
      </div>
    );
  }

  if (completedAndHide) {
    return (
      <div>
        <DisplayBreadcrumbs />
        <h1>This image is complete</h1>
        <HrefLink href={backLink}>Go back to resource</HrefLink>
      </div>
    );
  }

  console.log({model});

  return (
    <div>
      <DisplayBreadcrumbs />
      <LocaleString as="h1">{canvas.label}</LocaleString>
      {project && canvasTask ? (
        <SubmissionDetails
          backLink={backLink}
          canvasTask={canvasTask}
          userTasks={userTasks as any[]}
          refresh={refetch as any}
        />
      ) : null}

      <>
        {preventCanvasNavigation && !manifestUserTasks?.length ? (
          <div
            style={{ textAlign: 'center', padding: '2em', marginTop: '1em', marginBottom: '1em', background: '#eee' }}
          >
            <LockIcon style={{ fontSize: '3em' }} />
            <Heading3>This canvas is not available to browse</Heading3>
          </div>
        ) : null}
        {!api.getIsServer() && id && !model && canvas && (!preventCanvasNavigation || bypassCanvasNavigation) ? (
          <PreModelViewer
            backLink={backLink}
            canvas={canvas}
            onContribute={project ? prepareContribution : undefined}
          />
        ) : null}
        {!api.getIsServer() && id && project && model && (!preventCanvasNavigation || bypassCanvasNavigation) ? (
          <>
            <CaptureModelViewer
              revisionId={revision}
              modelId={model.id as string}
              backLink={backLink}
              onSave={async (response: RevisionRequest, respStatus: string | undefined) => {
                if (respStatus === 'draft') {
                  // Create user task and mark as in progress.
                  await api.createResourceClaim(project.id, {
                    revisionId: response.revision.id,
                    manifestId: manifestId ? Number(manifestId) : undefined,
                    canvasId: Number(id),
                    collectionId: collectionId ? Number(collectionId) : undefined,
                    status: 1,
                  });
                }

                if (respStatus === 'submitted') {
                  // Create user task and mark as in review.
                  await api.createResourceClaim(project.id, {
                    revisionId: response.revision.id,
                    manifestId: manifestId ? Number(manifestId) : undefined,
                    canvasId: Number(id),
                    collectionId: collectionId ? Number(collectionId) : undefined,
                    status: 2,
                  });
                }

                await refetch();
              }}
            />
          </>
        ) : null}
      </>
      {preventCanvasNavigation && !bypassCanvasNavigation ? null : (
        <CanvasNavigation
          subRoute="model"
          manifestId={manifestId}
          canvasId={id}
          collectionId={collectionId}
          projectId={project?.slug}
        />
      )}
    </div>
  );
};
