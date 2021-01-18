import { mapPage } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { CreateNormalPageRequest } from '../../types/schemas/site-page';
import * as editorial from '../../database/queries/site-editorial';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const createPage: RouteMiddleware<{}, CreateNormalPageRequest> = async context => {
  const { siteId, id, name } = userWithScope(context, ['site.admin']);
  const body = context.requestBody;

  try {
    context.response.body = mapPage(await context.connection.one(editorial.addPage(body, siteId, { id, name })));
    context.response.status = 201;
  } catch (err) {
    throw new RequestError('Request error, make sure slug is unique');
  }
};
