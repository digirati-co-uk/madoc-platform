import { NotificationRequest } from '../../types/notifications';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export const getNotificationCount: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);

  context.response.body = {
    unread: await context.notifications.unreadCount(id, siteId),
  };
};
export const getNotifications: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.read']);
  const page = context.query.page ?? 0;

  const [totalItems, allNotifications, totalUnread] = await Promise.all([
    context.notifications.totalCount(id, siteId),
    context.notifications.getNotifications(id, page, siteId),
    context.notifications.unreadCount(id, siteId),
  ]);

  context.response.status = 200;
  context.response.body = {
    notifications: allNotifications,
    unread: totalUnread,
    pagination: {
      page: page,
      totalResults: totalItems,
      totalPages: Math.ceil(totalItems / 20),
    },
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
