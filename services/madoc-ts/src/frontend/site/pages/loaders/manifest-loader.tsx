import React, { useMemo } from 'react';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { CrowdsourcingManifestTask } from '../../../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingReview } from '../../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { Pagination } from '../../../../types/schemas/_pagination';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CollectionFull } from '../../../../types/schemas/collection-full';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../../shared/components/Breadcrumbs';
import { ManifestFull } from '../../../../types/schemas/manifest-full';

type ManifestLoaderType = {
  params: { id: string; collectionId?: string; slug?: string };
  query: { m: string; filter: string };
  variables: {
    id: number;
    collectionId?: number[];
    projectId?: string | number;
    page: number;
    filter: string | undefined;
  };
  data: ManifestFull & {
    manifestTask?: CrowdsourcingManifestTask | CrowdsourcingTask;
    userTasks?: Array<CrowdsourcingTask | CrowdsourcingReview>;
    canUserSubmit: boolean;
  };
  context: { collection: CollectionFull['collection'] };
};

export const ManifestLoader: UniversalComponent<ManifestLoaderType> = createUniversalComponent<ManifestLoaderType>(
  ({ route, collection, ...props }) => {
    const { resolvedData: data, refetch } = usePaginatedData(
      ManifestLoader,
      {},
      { refetchOnMount: false, refetchInterval: false, refetchOnWindowFocus: false }
    );

    const ctx = useMemo(() => (data ? { id: data.manifest.id, name: data.manifest.label } : undefined), [data]);

    if (!data) {
      return <DisplayBreadcrumbs />;
    }

    return (
      <BreadcrumbContext manifest={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          manifest: data ? data.manifest : undefined,
          pagination: data ? data.pagination : undefined,
          collection,
          manifestSubjects: data ? data.subjects : undefined,
          manifestTask: data.manifestTask,
          manifestUserTasks: data.userTasks,
          canUserSubmit: data.canUserSubmit,
          refetch,
        })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, query) => {
      return [
        'site-manifest',
        {
          id: Number(params.id),
          page: Number(query.m) || 0,
          projectId: params.slug,
          filter: query.filter,
        },
      ];
    },
    getData: async (key, vars, api) => {
      const [response, tasks] = await Promise.all([
        api.getSiteManifest(vars.id, { page: vars.page, project_id: vars.projectId, hide_status: vars.filter }),
        vars.projectId ? api.getSiteProjectManifestTasks(vars.projectId, vars.id) : {},
      ]);

      return {
        manifest: response.manifest,
        pagination: response.pagination,
        subjects: response.subjects,
        manifestTask: tasks.manifestTask,
        userTasks: tasks.userTasks,
        canUserSubmit: !!tasks.canUserSubmit,
      };
    },
  }
);
