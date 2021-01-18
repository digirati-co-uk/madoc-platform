import { sql } from 'slonik';
import { editPage, mapPage } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { CreateNormalPageRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const updatePage: RouteMiddleware<{ paths: string }, CreateNormalPageRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const pathToFind = `/${context.params.paths}`;
  const pageUpdates = context.requestBody;

  // Will throw if you point to a slugged post.
  const singlePage = await context.connection.one(sql<{ id: number }>`
    select id from site_pages where path = ${pathToFind} and (slug is null or slug = '') and site_id = ${siteId}
  `);

  const page = await context.connection.one(editPage(singlePage.id, pageUpdates, siteId));

  context.response.body = {
    page: mapPage(page),
  };
};
