import { DatabasePoolConnectionType, sql } from 'slonik';
import { NotFound } from '../../../utility/errors/not-found';

export async function requireCollection(connection: DatabasePoolConnectionType, collectionId: number, siteId: number) {
  const collection = await connection.maybeOne(sql`
    select resource_id
    from iiif_derived_resource
    where resource_id = ${collectionId}
      and site_id = ${siteId}
      and resource_type = 'collection'
  `);

  if (!collection) {
    throw new NotFound('Collection not found');
  }
}
