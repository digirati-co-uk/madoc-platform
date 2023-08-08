import { UserInformationRequest } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const saveUserSettings: RouteMiddleware<{}, UserInformationRequest> = async context => {
  const { id } = userWithScope(context, ['site.view']);

  await context.siteManager.updateUserInformation(id, context.requestBody);

  context.response.status = 200;
  context.response.body = { ok: true };
};
