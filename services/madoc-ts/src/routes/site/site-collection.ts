import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import {
  filterHiddenSubjects,
  isActiveTaskStatus,
  mapProjectTaskStatus,
  mapUserTaskStatus,
  RESOURCE_STATUS_AVAILABLE,
  RESOURCE_STATUS_COMPLETED,
  TaskSubjectStatus,
} from '../../utility/resource-status';

export type SiteCollectionQuery = {
  type?: 'manifest' | 'collection';
  parent_collections?: number[];
  project_id?: string | number;
  hide_status?: string;
  published?: boolean;
  page?: number;
};

interface TaskSubjectResponse {
  subjects: Array<TaskSubjectStatus & { assignee_id?: string }>;
}

function toSubjectMap(statuses?: TaskSubjectResponse) {
  const map = new Map<string, TaskSubjectStatus>();
  for (const status of statuses?.subjects || []) {
    if (isActiveTaskStatus(status.status)) {
      map.set(status.subject, status);
    }
  }
  return map;
}

function getSubjectSet(...statusResponses: Array<TaskSubjectResponse | undefined>) {
  const allSubjects = new Set<string>();
  for (const statusResponse of statusResponses) {
    for (const status of statusResponse?.subjects || []) {
      allSubjects.add(status.subject);
    }
  }
  return allSubjects;
}

function combineStatuses(projectStatuses: TaskSubjectResponse, userStatuses?: TaskSubjectResponse) {
  const allSubjects = getSubjectSet(projectStatuses, userStatuses);
  const projectSubjectMap = toSubjectMap(projectStatuses);
  const userSubjectMap = toSubjectMap(userStatuses);
  const combinedStatuses: Array<{ subject: string; status: number }> = [];

  for (const subject of allSubjects) {
    const userStatus = userSubjectMap.get(subject);
    const projectStatus = projectSubjectMap.get(subject);

    if (projectStatus?.status === RESOURCE_STATUS_COMPLETED || userStatus?.status === RESOURCE_STATUS_COMPLETED) {
      combinedStatuses.push({ subject, status: RESOURCE_STATUS_COMPLETED });
      continue;
    }

    if (userStatus) {
      combinedStatuses.push({ subject, status: mapUserTaskStatus(userStatus.status) });
      continue;
    }

    const projectResourceStatus = projectStatus
      ? mapProjectTaskStatus(projectStatus.status)
      : RESOURCE_STATUS_AVAILABLE;
    if (typeof projectResourceStatus !== 'undefined') {
      combinedStatuses.push({ subject, status: projectResourceStatus });
    }
  }

  return combinedStatuses;
}

export const siteCollection: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
  const userId = context.state.jwt?.user.id;
  const type = context.query.type || undefined;
  const projectId = context.query.project_id;
  const hideStatus: string[] | undefined = context.query.hide_status ? context.query.hide_status.split(',') : undefined;
  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;

  // @todo limit based on site configuration query.
  // @todo give hints for the navigation of collections
  // For this, we have
  //  - parentCollections: collection1,collection2
  //  - projectId
  //
  // Context: [projectId, ...parentCollections]

  if (!projectId || !hideStatus) {
    const [collection, project] = await Promise.all([
      siteApi.getCollectionById(Number(id), page, type, undefined, onlyPublished),
      projectId ? siteApi.getProjectTask(projectId) : undefined,
    ]);

    const members = collection.collection.items.map(item =>
      item.type.toLowerCase() === 'manifest' ? `urn:madoc:manifest:${item.id}` : `urn:madoc:collection:${item.id}`
    );

    if (project) {
      const projectStatuses = await siteApi.getTaskSubjects(project.task_id, members, {
        type: 'crowdsourcing-manifest-task',
      });
      const userStatuses = userId
        ? await siteApi.getTaskSubjects(project.task_id, members, {
            type: 'crowdsourcing-task',
            assigned_to: `urn:madoc:user:${userId}`,
          })
        : undefined;

      collection.subjects = combineStatuses(projectStatuses, userStatuses);
    }

    context.response.status = 200;
    context.response.body = collection;
    return;
  }

  // We have to load the project first.
  const project = await siteApi.getProjectTask(projectId);

  // Task subjects.
  const projectStatuses = await siteApi.getTaskSubjects(project.task_id, undefined, {
    type: 'crowdsourcing-manifest-task',
  });
  const userStatuses = userId
    ? await siteApi.getTaskSubjects(project.task_id, undefined, {
        type: 'crowdsourcing-task',
        assigned_to: `urn:madoc:user:${userId}`,
      })
    : undefined;

  const combinedStatuses = combineStatuses(projectStatuses, userStatuses);
  const { hiddenIds, visibleSubjects } = filterHiddenSubjects(combinedStatuses, hideStatus);

  // Finally we can make an optimum request to get a filtered collection set.
  const collection = await siteApi.getCollectionById(Number(id), page, type, hiddenIds, onlyPublished);

  collection.subjects = visibleSubjects;

  // And finally respond.
  context.response.status = 200;
  context.response.body = collection;
};
