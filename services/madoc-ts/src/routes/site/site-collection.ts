import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';

export type SiteCollectionQuery = {
  type?: 'manifest' | 'collection';
  parent_collections?: number[];
  project_id?: string | number;
  hide_status?: string;
  page?: number;
};

export const siteCollection: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;
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
      const response = await siteApi.getTaskSubjects(project.task_id, members, { type: 'crowdsourcing-manifest-task' });

      collection.subjects = response.subjects;
    }

    context.response.status = 200;
    context.response.body = collection;
    return;
  }

  // We have to load the project first.
  const project = await siteApi.getProjectTask(projectId);

  // And then load ALL of the statuses.
  const taskSubjects = await siteApi.getTaskSubjects(project.task_id, undefined, {
    type: 'crowdsourcing-manifest-task',
  });

  const filteredMembers: number[] = [];
  const filteredSubjects: typeof taskSubjects.subjects = [];

  for (const subject of taskSubjects.subjects) {
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
