import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useData, useStaticData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import {
  CanvasContext,
  useCanvas,
  useImageService,
  useThumbnail,
  useVaultEffect,
} from '@hyperion-framework/react-vault';
import { CanvasNormalized, ImageService } from '@hyperion-framework/types';
import { useApi } from '../../shared/hooks/use-api';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Button } from '../../shared/atoms/Button';
import { CanvasFull } from '../../../types/schemas/canvas-full';
import { BreadcrumbContext, DisplayBreadcrumbs, useBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Debug } from '../../shared/atoms/Debug';
import { AtlasAuto, GetTile, getTileFromCanvas, getTileFromImageService, TileSet } from '@atlas-viewer/atlas';

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
};

const Wunder: React.FC<{ canvas: CanvasNormalized; service: ImageService }> = ({ canvas, service }) => {
  const [tile, setTile] = useState<GetTile>();

  useEffect(() => {
    if (service) {
      getTileFromImageService((service as any).id, canvas.width, canvas.height).then(s => {
        setTile(s); // only show the first image.
      });
    }
  }, [service, canvas]);

  if (!tile) {
    return (
      <worldObject height={canvas.height} width={canvas.width}>
        <box target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }} id="123" backgroundColor="#000" />
      </worldObject>
    );
  }

  return <TileSet tiles={tile} x={0} y={0} width={canvas.width} height={canvas.height} />;
};

const TestComponent: React.FC = () => {
  const canvas = useCanvas();
  const { data: service } = useImageService();
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!canvas) {
    return null;
  }

  return (
    <div>
      {isLoaded ? (
        <AtlasAuto style={{ height: 600 }}>
          <world>
            <Wunder canvas={canvas} service={service as ImageService} />
          </world>
        </AtlasAuto>
      ) : null}
    </div>
  );
};

function useManifestProjects(manifestId?: string) {
  const api = useApi();

  return useQuery(
    ['manifest-project', { id: manifestId }],
    async () => {
      if (manifestId && api.isAuthorised()) {
        return api.getManifestProjects(Number(manifestId));
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

export const ViewCanvas: UniversalComponent<ViewCanvasType> = createUniversalComponent<ViewCanvasType>(
  () => {
    const { data } = useStaticData(ViewCanvas);
    const { id, manifestId, collectionId } = useParams();
    const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
    const projects = useManifestProjects(manifestId);
    const api = useApi();
    const history = useHistory();
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);

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

    const onContribute = (projectId: number) => {
      if (data && data.canvas) {
        // At this point a user has decided to contribute.
        // - They may have contributed before
        // - Someone else may have contributed
        // - They may not be allowed to contribute
        //
        // All of these things _could_ be shown to the user.
        // e.g. getting all tasks for this resource assigned to the user.
        // Anyway, the base case is:
        // - Create resource claim
        api
          .createResourceClaim(projectId, {
            collectionId: collectionId ? Number(collectionId) : undefined,
            manifestId: manifestId ? Number(manifestId) : undefined,
            canvasId: data.canvas.id,
          })
          .then(resp => {
            history.push(`/tasks/${resp.claim.id}`);
          });
      }
    };

    if (!data) {
      return (
        <BreadcrumbContext canvas={{ id: id as any, name: { none: ['...'] } }}>
          <DisplayBreadcrumbs />
        </BreadcrumbContext>
      );
    }

    // Prompted to contribute - or login to contribute.
    // Clicking contribute will create the tree of crowdsourcing tasks
    // - Check config service for capture model??
    // - Fork of the capture model
    //
    // Crowdsourcing task.
    // - One capture model PER resource PER site - based on the root capture model.
    // - Crowdsourcing task is ALWAYS created at the context.
    // - Limits for resources is based on the rules set.
    //    - Limits per capture model in project
    //    - Limits per structure in capture model in project
    // - Limits may be bypassed if manifest is claimed?
    //    - How are these rules applied to manifests.
    // - The capture model allows you to search for revisions by:
    //    - Resource
    //    - Context (site + project)
    //    - Structure
    // - This query will allow us to enforce the limits for per-resource contributions.
    //
    // With this in mind, we need to do the following.
    //
    // To view "my tasks" for this resource:
    // - Reverse lookup of resource.
    //
    // Search for capture model using query: [ resource, context (site or site + project depending on config) ]
    //
    // If a task does not exist at context, always create it.
    //
    //
    // Reviews
    // - Created at the same level as the task
    // - When a review is being.. reviewed, other reviews targeting the same resource will be accessible.
    //
    //
    // APIs
    // - get resource claims
    //   - Show current users tasks
    //
    // - claim resource at context
    //    - ensure task structure exists
    //    - check limits set in project
    //    - find or create capture model
    //    - create crowdsourcing task for user
    //
    // - un-claim
    //    - remove crowdsourcing task
    //    - remove revision?
    //
    // - Task updating
    // - Reacting to task update
    // - NEW FEATURE: event when ROOT task sub task status changes OR is created.

    return (
      <BreadcrumbContext canvas={ctx}>
        <DisplayBreadcrumbs />
        <LocaleString as="h1">{data.canvas.label}</LocaleString>
        {canvasRef ? (
          <CanvasContext canvas={canvasRef.id}>
            <TestComponent />
          </CanvasContext>
        ) : null}
        {projects.data ? (
          <>
            <h3>Projects</h3>
            {projects.data.projects.map(project => {
              return (
                <div key={project.id}>
                  <LocaleString as={'h4'}>{project.label}</LocaleString>
                  <LocaleString as={'p'}>{project.summary}</LocaleString>
                  <Button onClick={() => onContribute(project.id)}>Contribute</Button>
                </div>
              );
            })}
          </>
        ) : null}
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
