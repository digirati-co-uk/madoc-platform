import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteCaptureModel: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, id: userId, name: userName } = userWithScope(context, ['site.admin']);

  const { id } = context.requestBody;

  if (!id) {
    throw new RequestError('No capture model id to remove');
  }

  const siteApi = api.asUser({ siteId, userId, userName }, {}, true);
  context.disposableApis.push(siteApi); // Need to dispose since it has extensions.

  try {
    const modelToDelete = await siteApi.crowdsourcing.getCaptureModel(id);
    if (modelToDelete) {
      // 1. Delete model.
      // 2. Delete tasks.

      await siteApi.getTasks(1, {
        all_tasks: true,
        all: true,
      });
    } else {
      context.response.status = 200;
    }
  } catch (e) {
    console.log(e);
    context.response.status = 200;
  }
};
