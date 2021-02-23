import { RouteMiddleware } from '../../types/route-middleware';
import { CreateNormalPageRequest } from '../../types/schemas/site-page';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const createPage: RouteMiddleware<{}, CreateNormalPageRequest> = async context => {
  const { siteId, id, name } = userWithScope(context, ['site.admin']);
  const body = context.requestBody;

  try {
    context.response.body = await context.pageBlocks.createPage(body, siteId, { id, name });
    context.response.status = 201;
  } catch (err) {
    throw new RequestError('Request error, make sure slug is unique');
  }
};
