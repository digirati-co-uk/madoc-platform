import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listAllUsers: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const validSorts = ['id', 'name', 'email', 'is_active', 'created', 'modified', 'role'];

  const search = context.query.search || context.query.q || '';
  const sort = context.query.sort_by || '';
  const role = context.query.role;
  const roles = (context.query.roles || '')
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);
  const status = context.query.status;
  const automated = context.query.automated === 'true' ? true : context.query.automated === 'false' ? false : undefined;

  const [sortName] = sort.split(':');
  if (!validSorts.includes(sortName)) {
    throw new RequestError('Invalid sort');
  }

  const query = { status, role, roles, automated, search };

  const usersPerPage = 50;
  const totalResults = await context.siteManager.countAllUsers(query);
  const totalPages = Math.ceil(totalResults / usersPerPage) || 1;
  const requestedPage = Number(context.query.page) || 1;
  const page = requestedPage < totalPages ? requestedPage : totalPages;

  context.response.body = {
    users: await context.siteManager.getAllUsers(page, usersPerPage, query, sort),
    pagination: {
      page,
      totalResults,
      totalPages,
    },
  };
};
