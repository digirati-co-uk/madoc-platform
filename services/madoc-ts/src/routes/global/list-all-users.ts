import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listAllUsers: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const usersPerPage = 50;
  const totalResults = await context.siteManager.countAllUsers();
  const totalPages = Math.ceil(totalResults / usersPerPage) || 1;
  const requestedPage = Number(context.query.page) || 1;
  const page = requestedPage < totalPages ? requestedPage : totalPages;

  context.response.body = {
    users: await context.siteManager.getAllUsers(page, usersPerPage),
    pagination: {
      page,
      totalResults,
      totalPages,
    },
  };
};
