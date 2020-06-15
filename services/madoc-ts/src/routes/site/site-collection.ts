import { RouteMiddleware } from '../../types/route-middleware';

export type SiteCollectionQuery = {
  parent_collections?: number[];
  project_id?: string | number;
  page?: number;
};

export const siteCollection: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const page = Number(context.query.page || 1) || 1;
  const { id } = context.params;
  const { siteApi } = context.state;

  // @todo limit based on site configuration query.
  // @todo give hints for the navigation of collections
  // For this, we have
  //  - parentCollections: collection1,collection2
  //  - projectId
  //
  // Context: [projectId, ...parentCollections]

  const collection = await siteApi.getCollectionById(Number(id), page);

  context.response.status = 200;
  context.response.body = collection;
};
