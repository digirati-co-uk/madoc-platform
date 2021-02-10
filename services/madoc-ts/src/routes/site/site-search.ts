import { getProject } from '../../database/queries/project-queries';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchQuery } from '../../types/search';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';

export const siteSearch: RouteMiddleware<
  { slug: string },
  SearchQuery & { projectId?: string | number; collectionId?: number; manifestId?: number }
> = async context => {
  const { page, madoc_id } = context.query;

  const id = context.state.jwt?.user.id;
  const site = await context.omeka.getSiteIdBySlug(context.params.slug);

  if (!site) {
    throw new NotFound('not found');
  }

  const siteApi = api.asUser({ userId: id, siteId: site.id });

  const { projectId, collectionId, manifestId, ...request } = context.requestBody;

  const searchQuery = request;

  searchQuery.contexts_all = searchQuery.contexts_all ? searchQuery.contexts_all : [];

  // Add project id if it exists.
  if (projectId) {
    const parsedId = projectId ? parseProjectId(`${projectId}`) : null;
    const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
    if (project) {
      searchQuery.contexts_all.push(`urn:madoc:project:${project.id}`);
    }
  }

  // These are exclusive for now.
  if (manifestId) {
    searchQuery.contexts_all.push(`urn:madoc:manifest:${manifestId}`);
  } else if (collectionId) {
    searchQuery.contexts_all.push(`urn:madoc:collection:${collectionId}`);
  }

  searchQuery.contexts_all.push(`urn:madoc:site:${site.id}`);

  context.response.body = await siteApi.searchQuery(searchQuery, page, madoc_id);
};
