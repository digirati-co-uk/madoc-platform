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
import { useMutation, useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { createLink } from '../../shared/utility/create-link';
import { ProjectSnippet } from '../../../types/schemas/project-snippet';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { Status } from '../../shared/atoms/Status';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { RevisionRequest } from '@capture-models/types';

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
  project: ProjectFull;
  canvasId: string;
  manifestId?: string;
  collectionId?: string;
}> = ({ canvasId, project, collectionId, manifestId }) => {
  const api = useApi();

  const { data: model } = useQuery(['canvas-tasks', { id: canvasId, projectId: project?.id }], async () => {
    if (!project) {
      return;
    }
    return await api.getSiteProjectCanvasTasks(project.id, Number(canvasId));
  });

  if (!model) {
    return null;
  }

  // @todo use the canvas task to show a status on this page.
  // @todo use the published model to show annotations to end users.

  return (
    <>
      {/*<div>{model.canvasTask ? <div>{model.canvasTask.status_text}</div> : null}</div>*/}
      {model.userTasks && model.userTasks.length ? (
        <TableContainer>
          {model.userTasks.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel>{task.name}</TableRowLabel>
              <TableRowLabel>{task.state.changesRequested}</TableRowLabel>
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

    return (
      <div>
        {!api.getIsServer() && id && data && !data.model?.model && data.canvas.canvas && (
          <PreModelViewer canvas={data.canvas.canvas} onContribute={project ? prepareContribution : undefined} />
        )}
        {!api.getIsServer() && data && id && project && data.model && data.model.model ? (
          <>
            <CaptureModelViewer
              revisionId={revision}
              modelId={data.model.model.id}
              backLink={createLink({
                canvasId: id,
                projectId: slug,
                manifestId,
                collectionId,
              })}
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
              }}
            />
          </>
        ) : null}
        {project && id ? (
          <SubmissionDetails project={project} canvasId={id} manifestId={manifestId} collectionId={collectionId} />
        ) : null}
      </div>
    );
  },
  {
    getKey: params => {
      return ['site-canvas', { id: Number(params.id), slug: params.slug }] as any;
    },
    getData: async (key, vars, api) => {
      return {
        canvas: await api.getSiteCanvas(vars.id),
        model: vars.slug && api.isAuthorised() ? await api.getSiteProjectCanvasModel(vars.slug, vars.id) : undefined,
      } as any;
    },
  }
);
