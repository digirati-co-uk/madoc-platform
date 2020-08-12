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
    manifest: ManifestFull['manifest'];
  };
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
  () => {
    const { data } = useStaticData(ViewCanvas);
    const { id, manifestId, collectionId } = useParams();
    const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
    const projects = useManifestProjects(manifestId);
    const structure = useManifestStructure(manifestId);
    const api = useApi();
    const history = useHistory();
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);
    const idx = structure.data && id ? structure.data.ids.indexOf(Number(id)) : null;
    const tempLabel = structure.data && idx !== null ? structure.data.items[idx].label : { none: ['...'] };
    const hasProjects = projects.data && idx !== null && projects.data.projects.length;

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
            history.push(`/tasks/${resp.claim.id}`);
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
        {canvasRef ? (
          <CanvasContext canvas={canvasRef.id}>
            <SimpleAtlasViewer style={{ height: hasProjects ? '50vh' : '70vh' }} />
          </CanvasContext>
        ) : null}
        {structure.data && idx !== null ? (
          <div style={{ display: 'flex', marginTop: '1em', marginBottom: '1em' }}>
            {idx > 0 ? (
              <SnippetStructure
                label="Previous:"
                alignment="left"
                link={`${collectionId ? `/collections/${collectionId}` : ''}/manifests/${manifestId}/c/${
                  structure.data.items[idx - 1].id
                }`}
                item={structure.data.items[idx - 1]}
              />
            ) : null}
            {idx < structure.data.items.length - 1 ? (
              <SnippetStructure
                label="Next:"
                alignment="right"
                link={`${collectionId ? `/collections/${collectionId}` : ''}/manifests/${manifestId}/c/${
                  structure.data.items[idx + 1].id
                }`}
                item={structure.data.items[idx + 1]}
              />
            ) : null}
          </div>
        ) : null}

        {hasProjects && projects.data ? (
          <ProjectListing projects={projects.data.projects} onContribute={onContribute} />
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
