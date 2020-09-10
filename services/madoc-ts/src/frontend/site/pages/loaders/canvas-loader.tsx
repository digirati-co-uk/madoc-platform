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
import { useStaticData } from '../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';

export type CanvasLoaderType = {
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
    canvas: CanvasFull['canvas'];
    canvasTask?: CrowdsourcingCanvasTask;
    manifestTask?: CrowdsourcingManifestTask;
    userTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
    canUserSubmit: boolean;
    model?: CaptureModel;
  };
  context: {
    project?: ProjectFull;
    manifest: ManifestFull['manifest'];
    manifestUserTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
    refetch: () => Promise<any>;
  };
};

export const CanvasLoader: UniversalComponent<CanvasLoaderType> = createUniversalComponent<CanvasLoaderType>(
  ({ route, ...props }) => {
    const { data, refetch } = useStaticData(CanvasLoader);
    const ctx = useMemo(() => (data ? { id: data.canvas.id, name: data.canvas.label } : undefined), [data]);

    if (!data) {
      return <DisplayBreadcrumbs />;
    }

    return (
      <BreadcrumbContext canvas={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          canvas: data ? data.canvas : undefined,
          canvasTask: data ? data.canvasTask : undefined,
          manifestTask: data ? data.manifestTask : undefined,
          userTasks: data ? data.userTasks : undefined,
          model: data ? data.model : undefined,
          canUserSubmit: data.canUserSubmit,
          refetch,
        })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: params => {
      return ['site-canvas', { id: Number(params.id), slug: params.slug }] as any;
    },
    getData: async (key, vars, api) => {
      const [response, tasks, model] = await Promise.all([
        await api.getSiteCanvas(vars.id),
        vars.slug ? await api.getSiteProjectCanvasTasks(vars.slug, vars.id) : {},
        vars.slug ? await api.getSiteProjectCanvasModel(vars.slug, vars.id) : undefined,
      ]);

      return {
        canvas: response.canvas,
        canvasTask: tasks.canvasTask,
        userTasks: tasks.userTasks,
        canUserSubmit: !!tasks.canUserSubmit,
        manifestTask: tasks.manifestTask,
        model: model ? model.model : undefined,
      };
    },
  }
);
