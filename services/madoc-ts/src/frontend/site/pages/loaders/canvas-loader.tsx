import React, { useMemo } from 'react';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingManifestTask } from '../../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { CanvasFull } from '../../../../types/canvas-full';
import { ManifestFull } from '../../../../types/schemas/manifest-full';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ApiArgs, apiHooks } from '../../../shared/hooks/use-api-query';
import { useData } from '../../../shared/hooks/use-data';
import { HighlightedRegionProvider } from '../../../shared/hooks/use-highlighted-regions';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { useParams } from 'react-router-dom';
import { ManifestLoaderType } from './manifest-loader';

export type CanvasLoaderType = {
  params: {
    slug?: string; // project
    collectionId?: string;
    manifestId?: string;
    canvasId: string;
  };
  query: {};
  variables: ApiArgs<'getSiteCanvas'>;
  data: CanvasFull;
  context: Partial<ManifestLoaderType['context']> & {
    project?: ProjectFull;
    manifest: ManifestFull['manifest'];
    manifestUserTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
    canvasTask?: CrowdsourcingCanvasTask;
    manifestTask?: CrowdsourcingManifestTask;
    userTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
    canUserSubmit: boolean;
    refetch: () => Promise<any>;
    refetchManifestTasks: () => Promise<any>;
    refetchCanvasTasks: () => Promise<any>;
    refetchManifest: () => Promise<any>;
    isLoadingTasks: boolean;
    plaintext?: string;
  };
};

export const CanvasLoader: UniversalComponent<CanvasLoaderType> = createUniversalComponent<CanvasLoaderType>(
  ({ route, ...props }) => {
    const { canvasId: id, slug } = useParams<{ canvasId: string; slug?: string }>();
    const { data, refetch } = useData(CanvasLoader, []);
    const ctx = useMemo(
      () => (data ? { id: data.canvas.id, name: data.canvas.label || { none: ['Untitled canvas'] } } : undefined),
      [data]
    );

    const {
      data: tasks,
      isLoading: isLoadingTasks,
      refetch: refetchCanvasTasks,
    } = apiHooks.getSiteProjectCanvasTasks(() => (slug ? [slug, Number(id)] : undefined));
    const { data: model } = apiHooks.getSiteProjectCanvasModel(() => (slug ? [slug, Number(id)] : undefined));

    return (
      <BreadcrumbContext canvas={ctx}>
        <HighlightedRegionProvider>
          {renderUniversalRoutes(route.routes, {
            ...props,
            isLoadingTasks,
            canvas: data?.canvas,
            plaintext: data?.plaintext,
            canvasTask: tasks?.canvasTask,
            userTasks: tasks?.userTasks,
            canUserSubmit: !!tasks?.canUserSubmit,
            manifestTask: tasks?.manifestTask,
            model: model?.model,
            refetch,
            refetchCanvasTasks,
          })}
        </HighlightedRegionProvider>
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['getSiteCanvas', [Number(params.canvasId)]];
    },
    getData: async (key, vars, api) => {
      return api.getSiteCanvas(vars[0], { plaintext: true });
    },
  }
);
