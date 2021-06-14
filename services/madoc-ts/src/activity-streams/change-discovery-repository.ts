import { sql } from 'slonik';
import { BaseRepository } from '../repository/base-repository';
import { SQL_EMPTY } from '../utility/postgres-tags';
import { sqlDate } from '../utility/slonik-helpers';
import {
  ActivityItemRow,
  ChangeDiscoveryActivity,
  ChangeDiscoveryActivityRequest,
  ChangeDiscoveryActivityType,
} from './change-discovery-types';

type StreamOptions = { primaryStream: string; secondaryStream?: string };

export class ChangeDiscoveryRepository extends BaseRepository {
  async getTotalItems({ primaryStream, secondaryStream }: StreamOptions, siteId: number) {
    const { total_items } = await this.connection.one(sql<{ total_items: number }>`
      select COUNT(*) as total_items from change_discovery_activity
      where
        primary_stream = ${primaryStream} and
        site_id = ${siteId}
        ${secondaryStream ? sql`and secondary_stream = ${secondaryStream}` : sql`and secondary_stream is null`}
`);

    return total_items;
  }

  async getActivity(
    { primaryStream, secondaryStream }: StreamOptions,
    paging: { page: number; perPage: number },
    siteId: number
  ) {
    const offset = paging.perPage * paging.page;

    const items = await this.connection.any(sql<ActivityItemRow>`
        select * from change_discovery_activity
        where
            primary_stream = ${primaryStream} and
            site_id = ${siteId}
            ${secondaryStream ? sql`and secondary_stream = ${secondaryStream}` : sql`and secondary_stream is null`}
        order by end_time
        limit ${paging.perPage} offset ${offset}
    `);

    return items.map(item => this.mapActivity(item));
  }

  async resourceExists({ primaryStream, secondaryStream }: StreamOptions, canonicalId: string, siteId: number) {
    // Find the latest Add, Create, Delete or Remove for this resource in this site.
    const exists = await this.connection.maybeOne(sql<{ activity_type: string }>`
      select activity_type from change_discovery_activity
      where
        activity_type = ANY (${sql.array(['Add', 'Create', 'Delete', 'Remove'], 'text')}) and
        object_canonical_id = ${canonicalId} and
        primary_stream = ${primaryStream} and
        site_id = ${siteId}
        ${secondaryStream ? sql`and secondary_stream = ${secondaryStream}` : SQL_EMPTY}
      order by end_time desc
      limit 1
    `);

    return exists ? exists.activity_type !== 'Delete' && exists.activity_type !== 'Remove' : false;
  }

  async addActivity(
    action: ChangeDiscoveryActivityType,
    { primaryStream, secondaryStream }: StreamOptions,
    activity: ChangeDiscoveryActivityRequest,
    siteId: number
  ) {
    const { startTime, object, target, summary, actor } = activity;
    const { id, type, canonical, provider, seeAlso, ...otherProperties } = object;
    const allProperties = {
      seeAlso,
      provider,
      target,
      summary,
      actor,
      ...otherProperties,
    };

    const createdActivity = await this.connection.one(sql<ActivityItemRow>`
        insert into change_discovery_activity (
          activity_type,
          primary_stream,
          secondary_stream,
          object_id,
          object_type,
          object_canonical_id,
          start_time,
          site_id,
          properties
        ) VALUES (
          ${action},
          ${primaryStream},
          ${secondaryStream || null},
          ${id},
          ${type},
          ${canonical || id},
          ${startTime ? sqlDate(new Date(startTime)) : null},
          ${siteId},
          ${sql.json(allProperties as any)}
        ) returning *
    `);

    return this.mapActivity(createdActivity);
  }

  mapActivity(row: ActivityItemRow): ChangeDiscoveryActivity {
    const { actor, provider, seeAlso, summary, target, ...otherProperties } = row.properties || {};
    return {
      id: `${row.activity_id}`,
      type: row.activity_type as any,
      object: {
        id: row.object_id,
        type: row.object_type as any,
        canonical: row.object_canonical_id,
        provider: provider,
        seeAlso: seeAlso,
        ...(otherProperties || {}),
      },
      actor,
      summary,
      target,
      endTime: new Date(row.end_time).toISOString(),
      startTime: row.start_time ? new Date(row.start_time).toISOString() : undefined,
    };
  }
}
