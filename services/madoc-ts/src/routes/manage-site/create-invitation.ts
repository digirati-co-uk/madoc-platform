import { v4 } from 'uuid';
import { UserInvitationPostBody, UserInvitationsRequest } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

function parseExpires(date?: string | null): Date | null {
  if (!date) {
    return null;
  }

  switch (date) {
    case '1': {
      const newDate = new Date();
      newDate.setDate(new Date().getDate() + 1);
      return newDate;
    }
    case '7': {
      const newDate = new Date();
      newDate.setDate(new Date().getDate() + 7);
      return newDate;
    }
    case '28': {
      const newDate = new Date();
      newDate.setDate(new Date().getDate() + 28);
      return newDate;
    }
    case 'never': {
      return null;
    }
  }

  return new Date(date);
}

export const createInvitation: RouteMiddleware<unknown, UserInvitationPostBody> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);

  const invitation: UserInvitationsRequest = {
    invitation_id: v4(),
    ...context.requestBody,
    expires: parseExpires(context.requestBody.expires),
    role: 'viewer', // hard code this for now.
  };

  context.response.status = 201;
  context.response.body = await context.siteManager.createInvitation(invitation, siteId, userId);
};
