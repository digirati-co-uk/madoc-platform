import { generateId } from '@capture-models/helpers';
import { sql } from 'slonik';
import { CreateMediaRow, MediaItem, MediaRow, MediaSnippet } from '../types/media';
import { BaseRepository } from './base-repository';

export class MediaRepository extends BaseRepository {
  async createMedia(request: CreateMediaRow, data: { siteId: number; user: { id: number; name: string } }) {
    const id = generateId();

    return this.mapMediaRow(
      await this.connection.one(sql<MediaRow>`
        insert into media (id, site_id, file_name, extension, display_name, group_name, group_order, hashtags, thumbnails, size,
                           ingester, renderer, source, external, frozen, author_id, author_name, metadata)
        VALUES (${id},
                ${data.siteId},
                ${request.fileName},
                ${request.extension},
                ${request.displayName || null},
                ${request.group?.name || null},
                ${request.group?.order || null},
                ${sql.array(request.hashtags || [], 'text')},
                ${sql.json(request.thumbnails || {})},
                ${request.size},
                ${request.ingester},
                ${request.renderer},
                ${request.source},
                ${request.external || false},
                false,
                ${data.user.id},
                ${data.user.name},
                ${sql.json(request.metadata || {})}
        ) RETURNING *
    `),
      data.siteId
    );
  }

  async getMediaById(id: string, siteId: number) {
    return this.mapMediaRow(
      await this.connection.one(sql`select * from media where id = ${id} and site_id = ${siteId}`),
      siteId
    );
  }

  async getMediaItems(page: number, siteId: number, { perPage = 24 }: { perPage?: number }) {
    const offset = (page - 1) * perPage;
    const items = await this.connection.any(
      sql<
        MediaRow
      >`select id, display_name, thumbnails, file_name, modified, hashtags, size from media where site_id = ${siteId} limit ${perPage} offset ${offset}`
    );
    const { total } = await this.connection.one(
      sql<{ total: number }>`select count(*) as total from media where site_id = ${siteId}`
    );
    const totalPages = Math.ceil(total / perPage);

    return {
      items: items.map(item => this.mapMediaSnippet(item, siteId)),
      total,
      totalPages,
    };
  }

  async deleteMedia(id: string, siteId: number) {
    await this.connection.query(sql`
      delete from media where id = ${id} and site_id = ${siteId}
    `);
  }

  async updateMediaThumbs(id: string, siteId: number, newThumbs: any) {
    return this.mapMediaRow(
      await this.connection.one(
        sql`update media set thumbnails = ${sql.json(newThumbs)} where id = ${id} and site_id = ${siteId} returning *`
      ),
      siteId
    );
  }

  mapMediaSnippet(row: MediaRow, siteId: number): MediaSnippet {
    const { smallestThumbnail } = this.mapThumbnails(row.id, row.thumbnails, siteId);

    return {
      id: row.id,
      displayName: row.display_name,
      thumbnail: smallestThumbnail,
      fileName: row.file_name,
      modified: row.modified,
      hashtags: row.hashtags,
      size: row.size,
      publicLink: `/public/storage/urn:madoc:site:${siteId}/media/public/${row.id}/${row.file_name}`,
    };
  }

  mapThumbnails(id: string, thumbnails: MediaRow['thumbnails'], siteId: number) {
    const thumbs = thumbnails || {};
    const thumbKeys = Object.keys(thumbs);
    const smallestThumbnailSize = thumbKeys.sort((a, b) => Number(a) - Number(b))[0];
    const thumbnailMap: any = {};
    for (const key of thumbKeys) {
      thumbnailMap[key] = `/public/storage/urn:madoc:site:${siteId}/media/public/${id}/${thumbs[key]}`;
    }
    const smallestThumbnail = smallestThumbnailSize ? thumbnailMap[smallestThumbnailSize] : undefined;

    return {
      thumbnailMap,
      smallestThumbnail,
    };
  }

  mapMediaRow(row: MediaRow, siteId: number): MediaItem {
    const { smallestThumbnail, thumbnailMap } = this.mapThumbnails(row.id, row.thumbnails, siteId);

    return {
      id: row.id,
      group: row.group_name
        ? {
            name: row.group_name,
            order: row.group_order,
          }
        : undefined,
      fileName: row.file_name,
      external: row.external || false,
      thumbnail: smallestThumbnail,
      thumbnails: thumbnailMap,
      size: row.size,
      hashtags: row.hashtags || [],
      displayName: row.display_name,
      modified: row.modified,
      created: row.created,
      renderer: row.renderer,
      source: row.source,
      ingester: row.ingester,
      extension: row.extension,
      metadata: row.metadata,
      publicFolder: `/public/storage/urn:madoc:site:${siteId}/media/public/${row.id}/`,
      publicLink: `/public/storage/urn:madoc:site:${siteId}/media/public/${row.id}/${row.file_name}`,
    };
  }
}
