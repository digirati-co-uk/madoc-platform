import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseUrn } from '../../utility/parse-urn';

export type SiteManifestQuery = {
  page: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: string | number;
  parent_task?: string;
  hide_status?: string;
};

function mapUserSubjects(
  subjects: Array<{ subject: string; status: number }>,
  allSubjects: Array<{ subject: string; status: number }>,
  isPreparing = false
): Array<{ subject: string; status: number }> {
  const toRemove: string[] = [];
  const userSubjects = subjects
    .map(subject => {
      const allSubject = allSubjects.find(sub => sub.subject === subject.subject);
      if (allSubject) {
        if (allSubject.status === 3) {
          return undefined; // Does not matter how far the user was, it is complete.
        } else {
          // The users status takes precedent, so we will remove it later.
          toRemove.push(allSubject.subject);
        }
      }

      if (subject.status === 0 || subject.status === 1) {
        // In progress
        return {
          subject: subject.subject,
          status: 2,
        };
      }

      if (subject.status === 2 || subject.status === 3) {
        return {
          subject: subject.subject,
          status: 3,
        };
      }

      // Everything else is not started.
      return {
        subject: subject.subject,
        status: 0,
      };
    })
    .filter(Boolean) as Array<{ subject: string; status: number }>;

  const returnAllSubjects = allSubjects
    .map(subject => {
      if (toRemove.indexOf(subject.subject) !== -1) {
        return undefined;
      }

      if (isPreparing) {
        // Do something.

        if (subject.status === 0 || subject.status === 1) {
          return {
            subject: subject.subject,
            status: 2,
          };
        }
      }

      return subject;
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
          status: userId && !isPreparing ? 3 : undefined,
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
      status: userId && !isPreparing ? 3 : undefined,
    })
  ).subjects;

  const allSubjects = mapUserSubjects(userSubjects, taskSubjects, isPreparing);

  // const allSubjects = userId ? mapUserSubjects(taskSubjects.subjects) : taskSubjects.subjects;
  const filteredCanvases: number[] = [];
  const filteredSubjects: typeof allSubjects = [];

  for (const subject of allSubjects) {
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

  if (!manifest.manifest.published && !isSiteAdmin) {
    throw new NotFound('Manifest not found');
  }

  manifest.subjects = filteredSubjects;

  // And finally respond.
  context.response.status = 200;
  context.response.body = manifest;
};
