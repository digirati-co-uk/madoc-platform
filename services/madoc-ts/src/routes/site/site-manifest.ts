import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import {
  filterHiddenSubjects,
  mapProjectTaskStatus,
  mapUserTaskStatus,
  RESOURCE_STATUS_AVAILABLE,
  RESOURCE_STATUS_COMPLETED,
  TaskSubjectStatus,
} from '../../utility/resource-status';

export type SiteManifestQuery = {
  page: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: string | number;
  parent_task?: string;
  hide_status?: string;
};

function mapUserSubjects(
  subjects: TaskSubjectStatus[],
  allSubjects: TaskSubjectStatus[],
  isPreparing = false
): Array<{ subject: string; status: number }> {
  const overriddenSubjects = new Set<string>();
  const userSubjects = subjects
    .map(subject => {
      const allSubject = allSubjects.find(sub => sub.subject === subject.subject);
      if (allSubject?.status === RESOURCE_STATUS_COMPLETED) {
        return undefined; // Does not matter how far the user was, it is complete.
      }

      if (allSubject) {
        overriddenSubjects.add(allSubject.subject);
      }

      return {
        subject: subject.subject,
        status: mapUserTaskStatus(subject.status),
      };
    })
    .filter(Boolean) as Array<{ subject: string; status: number }>;

  const returnAllSubjects = allSubjects
    .map(subject => {
      if (overriddenSubjects.has(subject.subject)) {
        return undefined;
      }

      return {
        subject: subject.subject,
        status: mapProjectTaskStatus(subject.status, isPreparing) ?? RESOURCE_STATUS_AVAILABLE,
      };
    })
    .filter(Boolean) as Array<{ subject: string; status: number }>;

  return [
    // Return all of the user subjects.
    ...userSubjects,
    // and a subset of the rest.
    ...returnAllSubjects,
  ];
}

export const siteManifest: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
  const userId = context.state.jwt?.user.id;
  const projectId = context.query.project_id;
  const parentTaskId = context.query.parent_task;
  const isSiteAdmin = context.state.jwt?.scope.includes('site_admin');
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
  if ((!projectId && !parentTaskId) || !hideStatus) {
    const [manifest, project] = await Promise.all([
      siteApi.getManifestById(Number(id), page),
      projectId && !parentTaskId ? siteApi.getProjectTask(projectId) : undefined,
    ]);

    const isPreparing = project?.status === 4; // prepare
    const canvasIds = manifest.manifest.items.map(item => item.id);
    const taskId = project ? project.task_id : parentTaskId;

    if (taskId) {
      const canvasSubjects = canvasIds.map(canvasId => `urn:madoc:canvas:${canvasId}`);
      const userSubjects = userId
        ? (
            await siteApi.getTaskSubjects(taskId, canvasSubjects, {
              type: 'crowdsourcing-task',
              assigned_to: `urn:madoc:user:${userId}`,
            })
          ).subjects
        : [];
      const taskSubjects = (
        await siteApi.getTaskSubjects(taskId, canvasSubjects, {
          type: 'crowdsourcing-canvas-task',
        })
      ).subjects;

      manifest.subjects = mapUserSubjects(userSubjects, taskSubjects, isPreparing);
    }

    if (!manifest.manifest.published && !isSiteAdmin) {
      throw new NotFound('Manifest not found');
    }

    context.response.status = 200;
    context.response.body = manifest;
    return;
  }

  // We have to load the project first.
  const projectTask = parentTaskId ? undefined : await siteApi.getProjectTask(projectId);
  const taskId = parentTaskId ? parentTaskId : (await siteApi.getProjectTask(projectId)).task_id;
  const isPreparing = projectTask?.status === 4; // prepare

  const structures = await siteApi.getManifestStructure(Number(id));
  const subjects = structures.items.map(item => `urn:madoc:canvas:${item.id}`);

  // And then load ALL of the statuses.
  const userSubjects = userId
    ? (
        await siteApi.getTaskSubjects(taskId, subjects, {
          type: 'crowdsourcing-task',
          assigned_to: `urn:madoc:user:${userId}`,
        })
      ).subjects
    : [];
  const taskSubjects = (
    await siteApi.getTaskSubjects(taskId, subjects, {
      type: 'crowdsourcing-canvas-task',
    })
  ).subjects;

  const allSubjects = mapUserSubjects(userSubjects, taskSubjects, isPreparing);
  const { hiddenIds, visibleSubjects } = filterHiddenSubjects(allSubjects, hideStatus);

  // Finally we can make an optimum request to get a filtered collection set.
  const manifest = await siteApi.getManifestById(Number(id), page, hiddenIds);

  if (!manifest.manifest.published && !isSiteAdmin) {
    throw new NotFound('Manifest not found');
  }

  manifest.subjects = visibleSubjects;

  // And finally respond.
  context.response.status = 200;
  context.response.body = manifest;
};
