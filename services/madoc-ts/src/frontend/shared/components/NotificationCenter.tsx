import React, { useCallback, useEffect, useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import ReactTimeago from 'react-timeago';
import styled, { css } from 'styled-components';
import { Notification } from '../../../types/notifications';
import { parseAllUrn } from '../../../utility/parse-urn';
import { EmptyState } from '../layout/EmptyState';
import { useApi } from '../hooks/use-api';
import { useSite, useUser } from '../hooks/use-site';
import { NotificationIcon } from '../icons/NotificationIcon';
import { HrefLink } from '../utility/href-link';

const NotificationIconContainer = styled.button`
  padding: 0.2em;
  margin: 0 0.2em;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  border: none;
  background: none;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    fill: #fff;
    font-size: 1.2em;
  }
`;

const NotificationContainer = styled.div<{ $visible?: boolean }>`
  position: absolute;
  width: 360px;
  top: 36px;
  right: -40px;
  overflow: hidden;
  z-index: 15;

  color: #000;
  background: #ffffff;
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.21), 0 0px 0px 1px rgba(0, 0, 0, 0.21);
  border-radius: 5px;

  ${props =>
    props.$visible
      ? css`
          visibility: visible;
        `
      : css`
          visibility: hidden;
        `}
`;

const UnreadCounter = styled.div`
  background: red;
  color: #fff;
  top: -4px;
  right: -4px;
  position: absolute;
  border-radius: 10px;
  padding: 0.1em 0.4em;
  font-size: 0.8em;
  text-align: center;
`;

const NotificationListItem = styled.div<{ $unread: boolean }>`
  border-bottom: 1px solid #eee;
  padding: 0.4em;
  color: #999;
  background: #f9f9f9;
  display: flex;
  max-width: 100%;

  ${props =>
    props.$unread &&
    css`
      background: #fff;
      color: #000;
    `}
`;

const NotificationSection = styled.div`
  flex: 1 1 0px;
  min-width: 0;
`;

const NotificationTime = styled.div`
  font-size: 0.7em;
  color: #999;
`;

const NotificationTitle = styled.div<{ $unread: boolean }>`
  font-size: 0.8em;
  ${props =>
    props.$unread &&
    css`
      font-weight: bold;
    `}
`;

const NotificationSummary = styled.div`
  font-size: 0.8em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ClearNotifications = styled.button`
  border: none;
  padding: 0.5em;
  background: #ddd;
  border-radius: 3px;
  margin: 0.2em;
  font-size: 0.9em;
  text-align: center;
  width: 100%;
  &:disabled {
    background: #fff;
  }
`;

const InnerNotificationContainer = styled.div`
  max-height: 40vh;
  overflow-y: auto;
`;

const NotificationHeading = styled.div`
  padding: 1em 0.7em;
  font-size: 1em;
  border-bottom: 1px solid #eee;
`;

const MarkAsRead = styled.button`
  color: #1e347b;
  border: none;
  background: none;
  font-size: 0.7em;
  text-decoration: underline;
  float: right;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationThumbnail = styled.div`
  width: 2.8em;
  height: 2.8em;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 0.4em;

  img {
    width: 2.8em;
    height: 2.8em;
    object-fit: cover;
    object-position: 50% 50%;
  }
`;

export const useNotificationLink = (
  notification: Notification,
  isAdmin = false
): { isExternal?: boolean; link: string | null } => {
  const site = useSite();

  if (!notification || !notification.action || !notification.action.link) {
    return { link: null };
  }

  const actionLink = parseAllUrn(notification.action.link);

  if (actionLink?.type === 'task') {
    if (notification.action.id === 'task:admin') {
      if (isAdmin) {
        return { link: `/tasks/${actionLink.id}`, isExternal: false };
      } else {
        return { link: `/s/${site.slug}/admin/tasks/${actionLink.id}`, isExternal: true };
      }
    }

    if (isAdmin) {
      return { link: `/s/${site.slug}/tasks/${actionLink.id}`, isExternal: true };
    } else {
      return { link: `/tasks/${actionLink.id}`, isExternal: false };
    }
  }

  if (actionLink?.type === 'manifest') {
    if (isAdmin) {
      return { link: `/manifests/${actionLink.id}`, isExternal: true };
    }
  }

  return { link: null };
};

export const NotificationItem: React.FC<{
  notification: Notification;
  isAdmin?: boolean;
  refetch?: () => Promise<void>;
}> = ({ notification, isAdmin, refetch }) => {
  const { t } = useTranslation();
  const { isExternal, link } = useNotificationLink(notification, isAdmin);
  const api = useApi();
  const [markAsRead] = useMutation(async () => {
    if (!notification.readAt) {
      await api.notifications.readNotification(notification.id);
      if (refetch) {
        await refetch();
      }
    }
  });

  return (
    <NotificationListItem $unread={!notification.readAt}>
      <NotificationSection onClickCapture={() => markAsRead()}>
        {link ? (
          isExternal ? (
            <NotificationTitle as="a" href={link} $unread={!notification.readAt}>
              {t(notification.title)}
            </NotificationTitle>
          ) : (
            <NotificationTitle as={HrefLink} href={link} $unread={!notification.readAt}>
              {t(notification.title)}
            </NotificationTitle>
          )
        ) : (
          <NotificationTitle $unread={!notification.readAt}>{t(notification.title)}</NotificationTitle>
        )}
        <NotificationSummary>{notification.summary}</NotificationSummary>
        <NotificationTime>
          <ReactTimeago date={new Date(notification.createdAt)} />
        </NotificationTime>
      </NotificationSection>
      {notification.thumbnail ? (
        <NotificationThumbnail>
          <img src={notification.thumbnail} alt="" />
        </NotificationThumbnail>
      ) : null}
    </NotificationListItem>
  );
};

export const NotificationCenter: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const api = useApi();
  const user = useUser();
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { data: countData, refetch: refetchCount } = useQuery(
    ['notifications-count'],
    async () => {
      return api.notifications.getNotificationCount();
    },
    {
      refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always',
      enabled: !!user,
    }
  );
  const { data, refetch } = useQuery(
    ['notifications'],
    async () => {
      return api.notifications.getAllNotifications();
    },
    {
      enabled: internalIsOpen && user,
    }
  );

  const [markAllAsRead, markAllAsReadStatus] = useMutation(async () => {
    await api.notifications.readAllNotifications();
    await refetchCount();
    await refetch();
  });

  const [clearAll, clearAllStatus] = useMutation(async () => {
    await api.notifications.clearAllNotifications();
    await refetchCount();
    await refetch();
  });

  const { buttonProps, itemProps, isOpen } = useDropdownMenu(data?.notifications.length || 0);

  useEffect(() => {
    if (isOpen) {
      if (data?.unread !== countData?.unread) {
        refetch();
      }
      setInternalIsOpen(true);
    } else {
      setInternalIsOpen(false);
    }
  }, [isOpen]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchCount(), refetch()]);
  }, [refetch, refetchCount]);

  const unread = countData?.unread;

  if (!user) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <NotificationIconContainer {...buttonProps}>
        {unread ? <UnreadCounter>{unread > 9 ? '9+' : unread}</UnreadCounter> : null}
        <NotificationIcon style={{ fill: '#fff' }} />
      </NotificationIconContainer>
      <NotificationContainer $visible={isOpen} role="menu">
        <NotificationHeading>
          Notifications{' '}
          <MarkAsRead onClick={() => markAllAsRead()} disabled={markAllAsReadStatus.isLoading || unread === 0}>
            mark all as read
          </MarkAsRead>
        </NotificationHeading>
        {data && data.notifications.length ? (
          <>
            <InnerNotificationContainer>
              {data.notifications.map((notification, k) => {
                return (
                  <div key={notification.id} {...(itemProps[k] as any)}>
                    <NotificationItem notification={notification} isAdmin={isAdmin} refetch={refetchAll} />
                  </div>
                );
              })}
            </InnerNotificationContainer>
            <ClearNotifications onClick={() => clearAll()} disabled={clearAllStatus.isLoading}>
              Clear all notifications
            </ClearNotifications>
          </>
        ) : (
          <EmptyState $noMargin>{t('No notifications')}</EmptyState>
        )}
      </NotificationContainer>
    </div>
  );
};
