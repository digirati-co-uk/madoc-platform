import React, { useMemo, useState } from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { CanvasContext, useVaultEffect } from '@hyperion-framework/react-vault';
import { CanvasNormalized } from '@hyperion-framework/types';
import { useApi } from '../../shared/hooks/use-api';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CanvasFull } from '../../../types/schemas/canvas-full';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { SimpleAtlasViewer } from '../../shared/components/SimpleAtlasViewer';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { SnippetStructure } from '../../shared/components/StructureSnippet';
import { ProjectListingDescription, ProjectListingItem, ProjectListingTitle } from '../../shared/atoms/ProjectListing';
import { createLink } from '../../shared/utility/create-link';
import { ManifestProjectListing } from '../../shared/components/ManifestProjectListing';
import { ProjectFull } from '../../../types/schemas/project-full';
import { Heading3 } from '../../shared/atoms/Heading3';
import { HrefLink } from '../../shared/utility/href-link';
import { TableContainer, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { Status } from '../../shared/atoms/Status';
import { Button } from '../../shared/atoms/Button';

type ViewCanvasType = {
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
  data: CanvasFull;
  context: {
    project?: ProjectFull;
    manifest: ManifestFull['manifest'];
  };
};

function useManifestStructure(manifestId?: string) {
  const api = useApi();

  return useQuery(
    ['manifest-structure', { id: manifestId }],
    async () => {
      if (manifestId) {
        const structure = await api.getSiteManifestStructure(Number(manifestId));

        return {
          ids: structure.items.map(item => item.id),
          items: structure.items,
        };
      }
      return undefined;
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}

const ContinueSubmission: React.FC<{
  project: ProjectFull;
  canvasId: number;
  manifestId?: number;
  collectionId?: number;
  onContribute?: (projectId: string | number) => void;
}> = ({ project, onContribute, canvasId, manifestId, collectionId }) => {
  const api = useApi();
  const { user } = api.getCurrentUser() || {};

  const { data: model } = useQuery(['canvas-tasks', { id: canvasId, projectId: project?.id }], async () => {
    if (!project) {
      return;
    }
    return await api.getTasks(0, {
      root_task_id: project?.task_id,
      subject: `urn:madoc:canvas:${canvasId}`,
      detail: true,
    });
  });

  const [continueSubmission, continueCount] = useMemo(() => {
    let totalReady = 0;
    const allModels = model
      ? model.tasks.filter(task => {
          if (user && task.assignee?.id === user.id && task.type === 'crowdsourcing-task') {
            if (task.status !== -1 && task.status !== 3) {
              totalReady++;
            }
            return true;
          }
          return false;
        })
      : null;

    return [allModels, totalReady] as const;
  }, [model, user]);

  const reviews = useMemo(
    () =>
      model
        ? model.tasks.filter(task => task.type === 'crowdsourcing-review' && (task.status === 2 || task.status === 1))
        : null,
    [model]
  );

  const reviewComponent =
    reviews && reviews.length ? (
      <div>
        <Heading3>Reviews</Heading3>
        <TableContainer>
          {reviews.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status as any} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel>
                <Link to={`/tasks/${task.id}`}>{task.name}</Link>
              </TableRowLabel>
            </TableRow>
          ))}
        </TableContainer>
      </div>
    ) : null;

  if (continueSubmission?.length) {
    return (
      <div>
        <ProjectListingItem key={project.id}>
          <ProjectListingTitle>
            <HrefLink href={`/projects/${project.id}`}>
              <LocaleString>{project.label}</LocaleString>
            </HrefLink>
          </ProjectListingTitle>
          <ProjectListingDescription>
            <LocaleString>{project.summary}</LocaleString>
          </ProjectListingDescription>
          {!continueCount ? (
            <ProjectListingDescription>You have already completed this item</ProjectListingDescription>
          ) : null}
          <Button
            as={HrefLink}
            href={createLink({ projectId: project.slug, manifestId, canvasId, collectionId, subRoute: 'model' })}
            style={{ display: 'inline-block' }}
          >
            {continueCount ? `Continue submission (${continueCount})` : 'Add new submission'}
          </Button>
        </ProjectListingItem>
        {reviewComponent}
      </div>
    );
  }

  return (
    <div>
      <ProjectListingItem key={project.id}>
        <ProjectListingTitle>
          <HrefLink href={`/projects/${project.id}`}>
            <LocaleString>{project.label}</LocaleString>
          </HrefLink>
        </ProjectListingTitle>
        <ProjectListingDescription>
          <LocaleString>{project.summary}</LocaleString>
        </ProjectListingDescription>
        {user ? (
          <Button
            as={HrefLink}
            href={createLink({ projectId: project.slug, manifestId, canvasId, collectionId, subRoute: 'model' })}
            style={{ display: 'inline-block' }}
          >
            Contribute
          </Button>
        ) : null}
      </ProjectListingItem>
      {reviewComponent}
    </div>
  );
};

export const ViewCanvas: UniversalComponent<ViewCanvasType> = createUniversalComponent<ViewCanvasType>(
  ({ project }) => {
    const { data } = useStaticData(ViewCanvas);
    const { id, manifestId, collectionId, slug } = useParams();
    const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
    const structure = useManifestStructure(manifestId);
    const history = useHistory();

    const api = useApi();
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);
    const idx = structure.data && id ? structure.data.ids.indexOf(Number(id)) : null;
    const tempLabel = structure.data && idx !== null ? structure.data.items[idx].label : { none: ['...'] };

    const onContribute = (projectId: number | string) => {
      api
        .createResourceClaim(projectId, {
          collectionId: collectionId ? Number(collectionId) : undefined,
          manifestId: manifestId ? Number(manifestId) : undefined,
          canvasId: Number(id),
        })
        .then(resp => {
          history.push(
            createLink({
              projectId: project?.id,
              taskId: resp.claim.id,
            })
          );
        });
    };

    useVaultEffect(
      vault => {
        if (data && data.canvas) {
          vault
            .load(
              data.canvas.source.id || data.canvas.source['@id'],
              data.canvas.source['@id']
                ? {
                    '@context': 'http://iiif.io/api/presentation/2/context.json',
                    ...data.canvas.source,
                  }
                : data.canvas.source
            )
            .then(c => {
              setCanvasRef(c as any);
            });
        }
      },
      [data]
    );

    return (
      <BreadcrumbContext canvas={ctx}>
        {data ? (
          <DisplayBreadcrumbs />
        ) : (
          <BreadcrumbContext canvas={{ id: id as any, name: tempLabel }}>
            <DisplayBreadcrumbs />
          </BreadcrumbContext>
        )}
        <LocaleString as="h1">{data ? data.canvas.label : tempLabel}</LocaleString>
        {project && !api.getIsServer() ? (
          <ContinueSubmission
            onContribute={onContribute}
            canvasId={Number(id)}
            manifestId={manifestId ? Number(manifestId) : undefined}
            collectionId={collectionId ? Number(collectionId) : undefined}
            project={project}
          />
        ) : null}
        {canvasRef ? (
          <CanvasContext canvas={canvasRef.id}>
            <SimpleAtlasViewer style={{ height: project ? '50vh' : '60vh' }} />
          </CanvasContext>
        ) : null}
        {structure.data && idx !== null ? (
          <div style={{ display: 'flex', marginTop: '1em', marginBottom: '1em' }}>
            {idx > 0 ? (
              <SnippetStructure
                label="Previous:"
                alignment="left"
                link={createLink({
                  projectId: slug,
                  collectionId,
                  manifestId,
                  canvasId: structure.data.items[idx - 1].id,
                })}
                item={structure.data.items[idx - 1]}
              />
            ) : null}
            {idx < structure.data.items.length - 1 ? (
              <SnippetStructure
                label="Next:"
                alignment="right"
                link={createLink({
                  projectId: slug,
                  collectionId,
                  manifestId,
                  canvasId: structure.data.items[idx + 1].id,
                })}
                item={structure.data.items[idx + 1]}
              />
            ) : null}
          </div>
        ) : null}

        {!project && manifestId ? <ManifestProjectListing manifestId={manifestId} onContribute={onContribute} /> : null}
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['site-canvas', { id: Number(params.id) }] as any;
    },
    getData: async (key, vars, api) => {
      return api.getSiteCanvas(vars.id);
    },
  }
);
