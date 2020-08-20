import { sql } from 'slonik';
import { SQL_AND, SQL_COMMA, SQL_EMPTY, SQL_INT_ARRAY } from '../../utility/postgres-tags';

export type ResourceLink<ExtraProperties = any> = {
  id?: string;
  uri: string;
  label: string;
  property: string;
  site_id?: number;
  resource_id?: number;
  type?: string;
  source?: string;
  file_path?: string;
  file_bucket?: string;
  file_hash?: string;
  motivation?: string;
  format?: string;
  properties?: ExtraProperties;
};

export type ResourceLinkResponse<T = { [key: string]: any }> = {
  id: number;
  resource_id: number;
  property: string;
  source?: string;
  link: {
    id: string;
    label: string;
    type?: string;
    format?: string;
    motivation?: string;
  } & T;
  file?: {
    path: string;
    bucket: string;
    hash?: string;
  };
};

export type ResourceLinkRow<ExtraProperties = any> = ResourceLink<ExtraProperties> & {
  id: number;
  uri: string;
  label: string;
  property: string;
  site_id: number;
  resource_id: number;
  type?: string;
  modified_at: Date;
  created_at: Date;
  source?: string;
  file_path?: string;
  file_bucket?: string;
  file_hash?: string;
  motivation?: string;
  format?: string;
  properties?: ExtraProperties;
};

export function mapLink<T = any>(inputLink: ResourceLinkRow<T>): ResourceLinkResponse<T> {
  return {
    id: inputLink.id,
    resource_id: inputLink.resource_id,
    source: inputLink.source || undefined,
    property: inputLink.property,
    link: {
      id: inputLink.uri,
      type: inputLink.type || undefined,
      label: inputLink.label,
      format: inputLink.format || undefined,
      motivation: inputLink.motivation || undefined,
      ...((inputLink.properties as any) || {}),
    },
    file:
      inputLink.file_path && inputLink.file_bucket
        ? {
            bucket: inputLink.file_bucket,
            hash: inputLink.file_hash,
            path: inputLink.file_path,
          }
        : undefined,
  };
}

export function getLinks({
  site_id,
  type,
  resource_id,
  format,
  source,
  property,
  propertyMatch,
}: {
  site_id: number;
  type?: string;
  resource_id?: number;
  source?: string;
  format?: string;
  property?: string;
  propertyMatch?: any;
}) {
  const queries = [sql`site_id = ${site_id}`];

  if (type) {
    queries.push(sql`type = ${type}::text`);
  }

  if (source) {
    queries.push(sql`source = ${source}::text`);
  }

  if (format) {
    queries.push(sql`format = ${format}::text`);
  }

  if (property) {
    queries.push(sql`property = ${property}::text`);
  }

  if (propertyMatch && Object.keys(propertyMatch).length) {
    queries.push(sql`properties <@ ${sql.json(propertyMatch)}::jsonb`);
  }

  if (resource_id) {
    queries.push(sql`resource_id = ${resource_id}`);
  }

  return sql<ResourceLinkRow>`
    select * from iiif_linking where ${sql.join(queries, SQL_AND)}
  `;
}

export function addLinks(added: ResourceLink[], resource_id: number, site_id: number | null) {
  if (added.length === 0) {
    return;
  }
  const values = added.map(
    item =>
      sql`(${sql.join(
        [
          // Required.
          item.uri,
          item.label,
          item.property,
          item.type || null,
          item.source || null,
          item.file_path || null,
          item.file_bucket || null,
          item.file_hash || null,
          item.motivation || null,
          item.format || null,
          item.properties ? sql.json(item.properties) : null,
          resource_id,
          site_id || null,
        ],
        SQL_COMMA
      )})`
  );

  return sql`
      insert into iiif_linking (
        uri, 
        label,
        property,
        type,
        source,
        file_path,
        file_bucket,
        file_hash,
        motivation,
        format,
        properties, 
        resource_id,
        site_id
      ) values ${sql.join(values, SQL_COMMA)} on conflict do nothing
  `;
}

export function updateLinks(links: ResourceLinkRow[], resource_id: number, site_id: number) {
  if (links.length === 0) {
    return;
  }

  const values = links.map(
    item =>
      sql`(${sql.join(
        [
          // Required.
          Number(item.id),
          item.uri,
          item.label,
          item.property,
          item.type || null,
          item.source || null,
          item.file_path || null,
          item.file_bucket || null,
          item.file_hash || null,
          item.motivation || null,
          item.format || null,
          item.properties || null,
        ],
        SQL_COMMA
      )})`
  );

  return sql`
      with input (id, uri, label, property, type, source, file_path, file_bucket, file_hash, motivation, format, properties) as (values ${sql.join(
        values,
        SQL_COMMA
      )})
      update iiif_linking as m
      set uri               = input.uri::text,
          label             = input.label::text,
          property          = input.property::text,
          type              = input.type::text,
          source            = input.source::text,
          file_path         = input.file_path::text,
          file_bucket       = input.file_bucket::text,
          file_hash         = input.file_hash::text,
          motivation        = input.motivation::text,
          format            = input.format::text,
          properties        = input.properties::json
      from input
      where input.id::int      = m.id::int 
        and m.resource_id = ${Number(resource_id)}::int 
        and m.site_id     = ${Number(site_id)}::int
  `;
}

export function removeLinks(ids: number[], site_id: number, resource_id?: number) {
  if (ids.length === 0) {
    return;
  }

  return sql`
    delete from iiif_linking 
    where id            = any (${sql.array(ids, SQL_INT_ARRAY)}) 
      and site_id       = ${Number(site_id)}::int
      ${resource_id ? sql`and resource_id   = ${Number(resource_id)}::int` : SQL_EMPTY}
  `;
}
