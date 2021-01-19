import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getMetadataValues: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const label = context.query.label;

  const perPage = 50;
  const page = Number(context.query.page) || 1;
  const offset = (page - 1) * perPage;

  if (!label) {
    context.response.body = {
      response: [],
    };
    return;
  }

  const values = await context.connection.any(sql`
      with parsed_values (key, value, resource_id) as (select key, value, resource_id, language, REGEXP_MATCHES(key, '^metadata\\.(\\d+)\\..*$', 'g') as rv
                             from iiif_metadata
                             where site_id = ${siteId}
      )
      select count(kv.resource_id) as total_items,
             kv.language           as language,
             pv.value              as value
      from parsed_values kv
               left join parsed_values pv
                         on kv.rv[1] = pv.rv[1] and pv.resource_id = kv.resource_id and pv.key ilike 'metadata.%.value'
      where kv.key ilike 'metadata.%.label'
        and kv.value = ${label}
      group by (kv.rv, kv.language, kv.value, pv.value)
      order by (total_items) desc
      limit ${perPage}
      offset ${offset};
  `);

  context.response.body = {
    page,
    values,
  };
};
