import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';

export type SiteCollectionQuery = {
  type?: 'manifest' | 'collection';
  parent_collections?: number[];
  project_id?: string | number;
  hide_status?: string;
  page?: number;
};

function combineStatuses(
  projectStatuses: { subjects: Array<{ subject: string; status: number; assignee_id?: string }> },
  userStatuses?: { subjects: Array<{ subject: string; status: number; assignee_id?: string }> }
) {
  const allSubjects = new Set<string>();
  const combinedStatues: Array<{ subject: string; status: number }> = [];
  const projectSubjectMap: {
    [subject: string]: { subject: string; status: number };
  } = {};
  const userSubjectMap: {
    [subject: string]: { subject: string; status: number };
  } = {};

  for (const projectStatus of projectStatuses.subjects) {
    allSubjects.add(projectStatus.subject);
    if (projectStatus.status !== -1) {
      projectSubjectMap[projectStatus.subject] = projectStatus;
    }
  }
  if (userStatuses) {
    for (const userStatus of userStatuses.subjects) {
      allSubjects.add(userStatus.subject);
      if (userStatus.status !== -1) {
        userSubjectMap[userStatus.subject] = userStatus;
      }
    }
  }

  for (const subject of allSubjects.values()) {
    const userStatus = userSubjectMap[subject];
    const projectStatus = projectSubjectMap[subject];

    // If the project has marked as done [done]
    if (projectStatus && projectStatus.status === 3) {
      combinedStatues.push({
        subject,
        status: 3,
      });
      continue;
    }

    // If the users submitted or completed item [done]
    if (userStatus && (userStatus.status === 2 || userStatus.status === 3)) {
      combinedStatues.push({
        subject,
        status: 3,
      });
      continue;
    }

    // Assigned to the user.
    if (userStatus && (userStatus.status === 0 || userStatus.status === 1)) {
      combinedStatues.push({
        subject,
        status: 2,
      });
      continue;
    }

    // If the users not assigned and its unavailable, mark as "done"
    if (projectStatus && projectStatus.status === 2) {
      combinedStatues.push({
        subject,
        status: 3,
      });
      continue;
    }

    // Available for working on.
    if (!userStatuses && (!projectStatus || projectStatus.status === 0 || projectStatus.status === 1)) {
      combinedStatues.push({
        subject,
        status: 1,
      });
    }
  }

  return combinedStatues;
}

export const siteCollection: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
  const userId = context.state.jwt?.user.id;
  const type = context.query.type || undefined;
  const projectId = context.query.project_id;
  const hideStatus: string[] | undefined = context.query.hide_status ? context.query.hide_status.split(',') : undefined;

  // @todo limit based on site configuration query.
  // @todo give hints for the navigation of collections
  // For this, we have
  //  - parentCollections: collection1,collection2
  //  - projectId
  //
  // Context: [projectId, ...parentCollections]

  if (!projectId || !hideStatus) {
    const [collection, project] = await Promise.all([
      siteApi.getCollectionById(Number(id), page, type),
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

  const combinedStatues = combineStatuses(projectStatuses, userStatuses);
  const filteredMembers: number[] = [];
  const filteredSubjects: typeof combinedStatues = [];

  for (const subject of combinedStatues) {
    const parsedUrn = parseUrn(subject.subject);
    // Skip invalid, if any.
    if (!parsedUrn) continue;
    // First check show

    // If we have hide status, then these matching will be excluded.
    if (hideStatus.indexOf(`${subject.status}`) !== -1) {
      filteredMembers.push(parsedUrn.id);
    } else {
      filteredSubjects.push(subject);
    }
  }

  // Finally we can make an optimum request to get a filtered collection set.
  const collection = await siteApi.getCollectionById(Number(id), page, type, filteredMembers);

  collection.subjects = filteredSubjects;

  // And finally respond.
  context.response.status = 200;
  context.response.body = collection;
};
