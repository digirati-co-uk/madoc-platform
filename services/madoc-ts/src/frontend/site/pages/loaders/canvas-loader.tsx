import { CaptureModel } from '@capture-models/types';
import React, { useMemo } from 'react';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingManifestTask } from '../../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { CanvasFull } from '../../../../types/schemas/canvas-full';
import { ManifestFull } from '../../../../types/schemas/manifest-full';
import { ProjectFull } from '../../../../types/schemas/project-full';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../../shared/components/Breadcrumbs';
import { ApiArgs, apiHooks } from '../../../shared/hooks/use-api-query';
import { useData, useStaticData } from '../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { useParams } from 'react-router-dom';

export type CanvasLoaderType = {
  params: {
    slug?: string; // project
    collectionId?: string;
    manifestId?: string;
    id: string;
  };
  query: {};
  variables: ApiArgs<'getSiteCanvas'>;
  data: CanvasFull;
  context: {
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
  };
};

export const CanvasLoader: UniversalComponent<CanvasLoaderType> = createUniversalComponent<CanvasLoaderType>(
  ({ route, ...props }) => {
    const { id, slug } = useParams<{ id: string; slug?: string }>();
    const { data, refetch } = useData(CanvasLoader, []);
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);

    const {
      data: tasks,
      isLoading: isLoadingTasks,
      refetch: refetchCanvasTasks,
    } = apiHooks.getSiteProjectCanvasTasks(() => (slug ? [slug, Number(id)] : undefined));
    const { data: model } = apiHooks.getSiteProjectCanvasModel(() => (slug ? [slug, Number(id)] : undefined));

    return (
      <BreadcrumbContext canvas={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          isLoadingTasks,
          canvas: data?.canvas,
          canvasTask: tasks?.canvasTask,
          userTasks: tasks?.userTasks,
          canUserSubmit: !!tasks?.canUserSubmit,
          manifestTask: tasks?.manifestTask,
          model: model?.model,
          refetch,
          refetchCanvasTasks,
        })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['getSiteCanvas', [Number(params.id)]];
    },
    getData: async (key, vars, api) => {
      return api.getSiteCanvas(vars[0]);
    },
  }
);
