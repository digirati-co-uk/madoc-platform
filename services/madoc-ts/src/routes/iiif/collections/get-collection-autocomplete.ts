import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';
import { parseProjectId } from '../../../utility/parse-project-id';
import { SQL_EMPTY, SQL_INT_ARRAY } from '../../../utility/postgres-tags';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const getCollectionAutocomplete: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const { q, project_id, blacklist_ids, page } = context.query;
  const { projectId, projectSlug } = parseProjectId(project_id);

  const blackListIds = (blacklist_ids || '')
    .split(',')
    .map((blacklistId: string) => Number(blacklistId))
    .filter((blacklistId: number) => !Number.isNaN(blacklistId));

  if (!q) {
    context.response.body = [];
    return;
  }

  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const query = sql`
    select distinct im.resource_id as id, im.value as label
    from iiif_derived_resource
             left join iiif_metadata im
                       on iiif_derived_resource.resource_id = im.resource_id and im.site_id = ${siteId} and im.key = 'label'
                           and im.value ilike '%' || ${q} || '%'
    ${
      projectId || projectSlug
        ? sql`left join iiif_derived_resource_items idri on iiif_derived_resource.resource_id = idri.item_id and idri.site_id = ${siteId}
             left join iiif_project ip on idri.resource_id = ip.collection_id`
        : SQL_EMPTY
    }
    where iiif_derived_resource.resource_type = 'collection'
      and im.resource_id is not null
      and flat = false
      ${projectId ? sql`and ip.id = ${projectId}` : SQL_EMPTY}
      ${projectSlug ? sql`and ip.slug = ${projectSlug}` : SQL_EMPTY}
      and iiif_derived_resource.id = any(${sql.array(blackListIds, SQL_INT_ARRAY)}) is false
      and iiif_derived_resource.site_id = ${siteId}
    limit ${pageSize} ${offset > 0 ? sql`offset ${offset}` : SQL_EMPTY};
  `;

  context.response.body = await context.connection.any<{ id: number; label: string }>(query);
};
