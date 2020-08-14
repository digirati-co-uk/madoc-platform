import React, { useMemo, useState } from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import { LocaleString } from '../../shared/components/LocaleString';
import { CanvasContext, useVaultEffect } from '@hyperion-framework/react-vault';
import { CanvasNormalized } from '@hyperion-framework/types';
import { useApi } from '../../shared/hooks/use-api';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import { CanvasFull } from '../../../types/schemas/canvas-full';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { SimpleAtlasViewer } from '../../shared/components/SimpleAtlasViewer';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { SnippetStructure } from '../../shared/components/StructureSnippet';
import { ProjectListing } from '../../shared/atoms/ProjectListing';
import { createLink } from '../../shared/utility/create-link';
import { ManifestProjectListing } from '../../shared/components/ManifestProjectListing';
import { ProjectFull } from '../../../types/schemas/project-full';

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

export const ViewCanvas: UniversalComponent<ViewCanvasType> = createUniversalComponent<ViewCanvasType>(
  ({ project }) => {
    const { data } = useStaticData(ViewCanvas);
    const { id, manifestId, collectionId, slug } = useParams();
    const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
    const structure = useManifestStructure(manifestId);
    const api = useApi();
    const history = useHistory();
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);
    const idx = structure.data && id ? structure.data.ids.indexOf(Number(id)) : null;
    const tempLabel = structure.data && idx !== null ? structure.data.items[idx].label : { none: ['...'] };

    // This will be replace the new published capture model endpoint.
    // const { data: model } = useQuery(['test', { id, projectId: project?.id }], () => {
    //   return api.getAllCaptureModels({
    //     target_id: `urn:madoc:canvas:${id}`,
    //     target_type: 'Canvas',
    //     derived_from: project?.capture_model_id,
    //   });
    // });

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

    const onContribute = (projectId: number | string) => {
      if (data && data.canvas) {
        api
          .createResourceClaim(projectId, {
            collectionId: collectionId ? Number(collectionId) : undefined,
            manifestId: manifestId ? Number(manifestId) : undefined,
            canvasId: data.canvas.id,
          })
          .then(resp => {
            history.push(
              createLink({
                projectId: project?.id,
                taskId: resp.claim.id,
              })
            );
          });
      }
    };

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
        {project ? (
          <ProjectListing projects={[project]} onContribute={api.isAuthorised() ? onContribute : undefined} />
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
