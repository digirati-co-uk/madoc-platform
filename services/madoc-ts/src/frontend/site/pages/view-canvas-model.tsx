import { CanvasFull } from '../../../types/schemas/canvas-full';
import { ProjectFull } from '../../../types/schemas/project-full';
import { ManifestFull } from '../../../types/schemas/manifest-full';
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

export const ViewCanvasModel: UniversalComponent<ViewCanvasModelType> = createUniversalComponent<ViewCanvasModelType>(
  ({ project }) => {
    const { data, refetch } = useData(ViewCanvasModel);
    const api = useApi();
    const { slug, collectionId, manifestId, id } = useParams();
    const { revision } = useLocationQuery();

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

    const completedAndHide =
      project?.config.allowSubmissionsWhenCanvasComplete === false && data?.canvasTask?.status === 3;

    const backLink = createLink({
      canvasId: id,
      projectId: slug,
      manifestId,
      collectionId,
    });

    if (!data?.canUserSubmit) {
      return (
        <div>
          <h1>Maximum number of contributors reached</h1>
          <HrefLink href={backLink}>Go back to resource</HrefLink>
        </div>
      );
    }

    if (completedAndHide) {
      return (
        <div>
          <h1>This image is complete</h1>
          <HrefLink href={backLink}>Go back to resource</HrefLink>
        </div>
      );
    }

    return (
      <div>
        {project && data?.canvasTask ? (
          <SubmissionDetails
            backLink={backLink}
            canvasTask={data?.canvasTask}
            userTasks={data?.userTasks}
            refresh={refetch as any}
          />
        ) : null}
        {!api.getIsServer() && id && data && !data.model?.model && data.canvas.canvas && (
          <PreModelViewer
            backLink={backLink}
            canvas={data.canvas.canvas}
            onContribute={project ? prepareContribution : undefined}
          />
        )}
        {!api.getIsServer() && data && id && project && data.model && data.model.model ? (
          <>
            <CaptureModelViewer
              revisionId={revision}
              modelId={data.model.model.id}
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
      </div>
    );
  },
  {
    getKey: params => {
      return ['site-canvas', { id: Number(params.id), slug: params.slug }] as any;
    },
    getData: async (key, vars, api) => {
      const tasks = vars.slug ? await api.getSiteProjectCanvasTasks(vars.slug, vars.id) : {};
      return {
        canvas: await api.getSiteCanvas(vars.id),
        canvasTask: tasks.canvasTask,
        userTasks: tasks.userTasks,
        canUserSubmit: !!tasks.canUserSubmit,
        model: vars.slug && api.isAuthorised() ? await api.getSiteProjectCanvasModel(vars.slug, vars.id) : undefined,
      } as any;
    },
  }
);
