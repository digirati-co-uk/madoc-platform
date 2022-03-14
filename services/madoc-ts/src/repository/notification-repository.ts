import { sql } from 'slonik';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { NotificationRow, Notification, NotificationRequest } from '../types/notifications';
import { BaseRepository } from './base-repository';

export class NotificationRepository extends BaseRepository {
  // Page size = 20
  async getNotifications(user_id: number, _page: number, site_id: number) {
    const pageSize = 20;
    const page = !Number.isNaN(_page) && _page >= 0 ? _page : 0;
    const offset = pageSize * page;

    const rows = await this.connection.any(sql<NotificationRow>`
        select * from notifications 
        where user_id = ${user_id} and site_id = ${site_id}
        order by created_at desc
        limit ${pageSize} offset ${offset}
    `);

    return rows.map(row => this.mapNotification(row));
  }

  async unreadCount(user_id: number, site_id: number) {
    return (
      await this.connection.one<{ unread_count: number }>(
        sql`select COUNT(*) as unread_count from notifications where read_at is null and user_id = ${user_id} and site_id = ${site_id}`
      )
    ).unread_count;
  }

  async totalCount(user_id: number, site_id: number) {
    return (
      await this.connection.one<{ total_count: number }>(
        sql`select COUNT(*) as total_count from notifications where user_id = ${user_id} and site_id = ${site_id}`
      )
    ).total_count;
  }

  async readNotification(id: string, user_id: number, site_id: number) {
    await this.connection.query(
      sql`update notifications set read_at = CURRENT_TIMESTAMP where id = ${id} and user_id = ${user_id} and site_id = ${site_id} and read_at is null`
    );
  }

  async clearNotification(id: string, user_id: number, site_id: number) {
    await this.connection.query(
      sql`delete from notifications where id = ${id} and user_id = ${user_id} and site_id = ${site_id}`
    );
  }

  async clearAllUserNotification(user_id: number, site_id: number) {
    await this.connection.query(sql`delete from notifications where user_id = ${user_id} and site_id = ${site_id}`);
  }

  async readAllUserNotifications(user_id: number, site_id: number) {
    await this.connection.query(
      sql`update notifications set read_at = CURRENT_TIMESTAMP where user_id = ${user_id} and site_id = ${site_id} and read_at is null`
    );
  }

  async addNotification(req: NotificationRequest, site_id: number): Promise<Notification> {
    return this.mapNotification(
      await this.connection.one(sql<NotificationRow>`
          insert into notifications (
             id, 
             title, 
             summary,  
             site_id, 
             user_id, 
             action_id, 
             action_link,
             action_text, 
             from_user_id, 
             from_user_name, 
             tags,
             thumbnail
         ) VALUES (
           ${generateId()},
           ${req.title},
           ${req.summary || null},
           ${site_id},
           ${req.user},
           ${req.action.id},
           ${req.action.link || null},
           ${req.action.text || null},
           ${req.from?.id || null},
           ${req.from?.name || null},
           ${req.tags ? sql.array(req.tags, 'text') : null},
           ${req.thumbnail || null}
         ) returning *
    `)
    );
  }

  mapNotification(row: NotificationRow): Notification {
    return {
      id: row.id,
      action: {
        id: row.action_id,
        text: row.action_text || undefined,
        link: row.action_link || undefined,
      },
      from: row.from_user_id
        ? {
            id: row.from_user_id,
            name: row.from_user_name || undefined,
          }
        : undefined,
      createdAt: row.created_at,
      readAt: row.read_at || undefined,
      summary: row.summary || undefined,
      thumbnail: row.thumbnail || undefined,
      tags: row.tags || [],
      title: row.title,
      user: row.user_id,
    };
  }
}
