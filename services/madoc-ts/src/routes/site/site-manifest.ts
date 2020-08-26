import { RouteMiddleware } from '../../types/route-middleware';

export type SiteManifestQuery = {
  page: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: string | number;
};

export const siteManifest: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
  const projectId = context.query.project_id;

  // @todo limit based on site configuration query.
  // @todo give hints for the navigation of collections
  // For this, we have
  //  - collectionId
  //  - parentCollectionIds: collection1,collection2
  //  - projectId
  //
  // Context: [projectId, ...parentCollectionIds, collectionId]

  const [manifest, project] = await Promise.all([
    siteApi.getManifestById(Number(id), page),
    projectId ? siteApi.getProjectTask(projectId) : undefined,
  ]);

  const canvasIds = manifest.manifest.items.map(item => item.id);

  if (project) {
    const response = await siteApi.getTaskSubjects(
      project.task_id,
      canvasIds.map(canvasId => `urn:madoc:canvas:${canvasId}`),
      { type: 'crowdsourcing-canvas-task' }
    );

    manifest.subjects = response.subjects;
  }

  context.response.status = 200;
  context.response.body = manifest;
};
