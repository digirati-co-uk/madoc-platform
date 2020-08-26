import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';

export type SiteManifestQuery = {
  page: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: string | number;
  hide_status?: string;
};

export const siteManifest: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
  const projectId = context.query.project_id;
  const hideStatus: string[] | undefined = context.query.hide_status ? context.query.hide_status.split(',') : undefined;

  // @todo limit based on site configuration query.
  // @todo give hints for the navigation of collections
  // For this, we have
  //  - collectionId
  //  - parentCollectionIds: collection1,collection2
  //  - projectId
  //
  // Context: [projectId, ...parentCollectionIds, collectionId]

  // This is the optimised path.
  if (!projectId || !hideStatus) {
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
    return;
  }

  // We have to load the project first.
  const project = await siteApi.getProjectTask(projectId);

  // And then load ALL of the statuses.
  const taskSubjects = await siteApi.getTaskSubjects(project.task_id, undefined, { type: 'crowdsourcing-canvas-task' });

  const filteredCanvases: number[] = [];
  const filteredSubjects: typeof taskSubjects.subjects = [];

  for (const subject of taskSubjects.subjects) {
    const parsedUrn = parseUrn(subject.subject);
    // Skip invalid, if any.
    if (!parsedUrn) continue;
    // First check show

    // If we have hide status, then these matching will be excluded.
    if (hideStatus.indexOf(`${subject.status}`) !== -1) {
      filteredCanvases.push(parsedUrn.id);
    } else {
      filteredSubjects.push(subject);
    }
  }

  // Finally we can make an optimum request to get a filtered collection set.
  const manifest = await siteApi.getManifestById(Number(id), page, filteredCanvases);

  manifest.subjects = filteredSubjects;

  (manifest as any).test = filteredCanvases;

  // And finally respond.
  context.response.status = 200;
  context.response.body = manifest;
};
