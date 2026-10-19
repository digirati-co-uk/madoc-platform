import { DatabasePoolConnectionType, DatabaseTransactionConnectionType, sql } from 'slonik';
import { AnalyticsCounts, AnalyticsReport } from '../types/analytics';

const counts = sql`
  coalesce(sum(a.page_views), 0)::float8 as "pageViews",
  coalesce(sum(a.signed_in_views), 0)::float8 as "signedInViews",
  coalesce(sum(a.page_views - a.signed_in_views), 0)::float8 as "anonymousViews",
  coalesce(sum(a.contributions_started), 0)::float8 as "contributionsStarted",
  coalesce(sum(a.contributions_completed), 0)::float8 as "contributionsCompleted",
  coalesce(sum(a.reviews_completed), 0)::float8 as "reviewsCompleted"
`;

export class AnalyticsRepository {
  constructor(private connection: DatabasePoolConnectionType) {}

  async recordPageView(siteId: number, projectId: number, signedIn: boolean) {
    await this.connection.query(sql`
      insert into analytics_daily (site_id, day, project_id, page_views, signed_in_views)
      values (${siteId}, (current_timestamp at time zone 'UTC')::date, ${projectId}, 1, ${signedIn ? 1 : 0})
      on conflict (site_id, day, project_id) do update set
        page_views = analytics_daily.page_views + 1,
        signed_in_views = analytics_daily.signed_in_views + excluded.signed_in_views
    `);
  }

  async report(siteId: number | null, days: number): Promise<AnalyticsReport> {
    const range = await this.connection.one<{ start: string; end: string; collectionStarted: string }>(sql`
      select to_char((current_timestamp at time zone 'UTC')::date - ${days - 1}::int, 'YYYY-MM-DD') as start,
        to_char((current_timestamp at time zone 'UTC')::date, 'YYYY-MM-DD') as end,
        to_char(started_on, 'YYYY-MM-DD') as "collectionStarted" from analytics_settings
    `);
    const where = sql`a.day between ${range.start}::date and ${range.end}::date
      ${siteId === null ? sql`` : sql`and a.site_id = ${siteId}`}`;
    const totals = await this.connection.one<AnalyticsCounts>(
      sql`select ${counts} from analytics_daily a where ${where}`
    );
    const daily = await this.connection.any<AnalyticsReport['daily'][number]>(sql`
      select to_char(d.day, 'YYYY-MM-DD') as date, ${counts}
      from generate_series(${range.start}::date, ${range.end}::date, '1 day'::interval) d(day)
      left join analytics_daily a on a.day = d.day ${siteId === null ? sql`` : sql`and a.site_id = ${siteId}`}
      group by d.day order by d.day
    `);
    const weekly = await this.connection.any<AnalyticsReport['weekly'][number]>(sql`
      select to_char(date_trunc('week', d.day), 'YYYY-MM-DD') as week,
        coalesce(sum(a.signed_in_views), 0)::float8 as "signedInViews"
      from generate_series(${range.start}::date, ${range.end}::date, '1 day'::interval) d(day)
      left join analytics_daily a on a.day = d.day ${siteId === null ? sql`` : sql`and a.site_id = ${siteId}`}
      group by date_trunc('week', d.day) order by date_trunc('week', d.day)
    `);
    const projects = await this.connection.any<AnalyticsReport['projects'][number]>(sql`
      select a.site_id as "siteId", s.title as "siteName", a.project_id as "projectId",
        coalesce(p.slug, case when a.project_id = 0 then 'Outside projects' else 'Deleted project' end) as "projectName",
        ${counts}
      from analytics_daily a join site s on s.id = a.site_id
      left join iiif_project p on p.id = a.project_id and p.site_id = a.site_id
      where ${where} group by a.site_id, s.title, a.project_id, p.slug order by sum(a.page_views) desc, a.site_id, a.project_id
    `);
    const sites =
      siteId === null
        ? await this.connection.any<AnalyticsReport['sites'][number]>(sql`
      select a.site_id as "siteId", s.title as "siteName", ${counts}
      from analytics_daily a join site s on s.id = a.site_id where ${where}
      group by a.site_id, s.title order by sum(a.page_views) desc, a.site_id
    `)
        : [];
    return {
      scope: siteId === null ? 'all' : 'site',
      ...range,
      totals,
      daily: [...daily],
      weekly: [...weekly],
      projects: [...projects],
      sites: [...sites],
    };
  }
}

/** Called only by live revision creation/update, never model imports or template cloning. */
export async function recordContributionAnalytics(
  transaction: DatabaseTransactionConnectionType,
  revisionId: string,
  siteId: number,
  created = false
) {
  // Lock the existing revision: concurrent saves cannot count the same milestone twice.
  // No author, revision, task, or model identifier is copied into analytics storage.
  await transaction.query(sql`
    with previous as materialized (
      select r.id, r.analytics_flags, r.status,
        coalesce((select p.id from iiif_project p join capture_model m
          on m.derived_from = p.capture_model_id and m.site_id = p.site_id
          where m.id = r.capture_model_id and p.site_id = r.site_id order by p.id limit 1), 0) as project_id
      from capture_model_revision r
      where r.id = ${revisionId} and r.site_id = ${siteId} and r.author_id is not null
        and coalesce(r.revision_data->>'source', '') <> 'canonical'
      for update
    ), milestones as (
      select *,
        case when ${created} and (analytics_flags & 1) = 0 then 1 else 0 end as started,
        case when status in ('submitted', 'accepted') and (analytics_flags & 2) = 0 then 1 else 0 end as completed,
        case when status in ('accepted', 'rejected') and (analytics_flags & 4) = 0 then 1 else 0 end as reviewed
      from previous
    ), marked as (
      update capture_model_revision r set analytics_flags = (m.analytics_flags | m.started | (m.completed * 2) | (m.reviewed * 4))::smallint
      from milestones m where r.id = m.id and (m.started + m.completed + m.reviewed) > 0
      returning m.project_id, m.started, m.completed, m.reviewed
    )
    insert into analytics_daily (site_id, day, project_id, contributions_started, contributions_completed, reviews_completed)
    select ${siteId}, (current_timestamp at time zone 'UTC')::date, project_id, started, completed, reviewed from marked
    on conflict (site_id, day, project_id) do update set
      contributions_started = analytics_daily.contributions_started + excluded.contributions_started,
      contributions_completed = analytics_daily.contributions_completed + excluded.contributions_completed,
      reviews_completed = analytics_daily.reviews_completed + excluded.reviews_completed
  `);
}
