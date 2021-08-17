import { useMutation } from 'react-query';
import { UpdateUser } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const updateUser: RouteMiddleware<{ userId: string }, UpdateUser> = async context => {
  await onlyGlobalAdmin(context);

  const userId = Number(context.params.userId);

  context.response.body = {
    user: await context.siteManager.updateUser(userId, context.requestBody),
  };
};
