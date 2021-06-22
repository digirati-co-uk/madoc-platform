import { NotificationRequest } from '../../types/notifications';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export const getNotifications: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);
  const page = context.query.page ?? 0;

  context.response.status = 200;
  context.response.body = {
    notifications: await context.notifications.getNotifications(id, page, siteId),
  };
};

export const createNotification: RouteMiddleware<{}, NotificationRequest> = async context => {
  // @todo For now, only site admins, but I think this should be it's own new scope.
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const requestNotification = context.requestBody;

  await context.notifications.addNotification(requestNotification, siteId);

  context.response.status = 201;
};

export const readNotification: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);

  await context.notifications.readNotification(context.params.id, id, siteId);

  context.response.status = 200;
};

export const readAllNotifications: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);

  await context.notifications.readAllUserNotifications(id, siteId);

  context.response.status = 200;
};

export const clearNotification: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);

  await context.notifications.clearNotification(context.params.id, id, siteId);

  context.response.status = 200;
};

export const clearAllNotifications: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);

  await context.notifications.clearAllUserNotification(id, siteId);

  context.response.status = 200;
};
