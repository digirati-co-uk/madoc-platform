import { createHash } from 'crypto';
import { sql } from 'slonik';
import { ResourceLinkRow, updateLinks } from '../../../database/queries/linking-queries';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { RequestError } from '../../../utility/errors/request-error';
import { userWithScope } from '../../../utility/user-with-scope';
import contentType from 'content-type';

function linkHash(uri: string) {
  return createHash('sha1')
    .update(uri)
    .digest('hex');
}

export const convertLinking: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { id } = context.params;

  // 1. Get link
  const link = await context.connection.one(
    sql<ResourceLinkRow>`select * from iiif_linking where id = ${id} and site_id = ${siteId}`
  );

  const userApi = api.asUser({ siteId });

  if (link.file_path && link.file_bucket) {
    // 1.1 return early if already de-ref
    context.response.body = {
      link,
    };
    return;
  }

  if ((link.type !== 'Text' && link.type !== 'Dataset') || !link.uri || !link.resource_id) {
    throw new RequestError('Unsupported link type');
  }

  // Helper that will actually do the conversion.
  async function updateConvertedLink(bucket: string, ext: string) {
    const newLink: ResourceLinkRow = {
      ...link,
      file_path: `public/${link.resource_id}/${linkHash(link.uri)}.${ext}`,
      file_bucket: bucket,
      uri: `/public/storage/urn:madoc:site:${siteId}/${bucket}/public/${link.resource_id}/${linkHash(link.uri)}.${ext}`,
      source: link.uri,
    };

    const linkQuery = updateLinks([newLink], link.resource_id, siteId);

    if (!linkQuery) {
      throw new Error('Problem saving links');
    }

    await context.connection.query(linkQuery);

    return await context.connection.one(
      sql<ResourceLinkRow>`select * from iiif_linking where id = ${id} and site_id = ${siteId}`
    );
  }

  // 2. Fetch external link
  const externalResourceResponse = await fetch(link.uri);
  if (!externalResourceResponse.ok) {
    throw new Error('Issue fetching link');
  }
  const mediaTypeHeader = externalResourceResponse.headers.get('Content-Type') || 'text/plain';
  const mediaType = contentType.parse(mediaTypeHeader);

  switch (mediaType.type) {
    // Plain text
    case 'text/plain': {
      // Grab XML
      const text = await externalResourceResponse.text();
      // Save XML.
      await userApi.saveStoragePlainText(
        'saved-linking',
        `${link.resource_id}/${linkHash(link.uri)}.txt`,
        text || ' ',
        true
      );
      // Update link.
      const newFetchedLink = await updateConvertedLink('saved-linking', 'txt');

      context.response.body = {
        link: newFetchedLink,
      };
      return;
    }

    // Various XML formats
    case 'text/xml':
    case 'application/xml+alto':
    case 'application/xml': {
      // Grab XML
      const text = await externalResourceResponse.text();
      // Save XML.
      await userApi.saveStorageXml('saved-linking', `${link.resource_id}/${linkHash(link.uri)}.xml`, text, true);
      // Update link.
      const newFetchedLink = await updateConvertedLink('saved-linking', 'xml');

      context.response.body = {
        link: newFetchedLink,
      };
      return;
    }

    // Various JSON formats.
    case 'application/json':
    case 'text/json':
    case 'application/ld+json': {
      // Grab JSON.
      const json = await externalResourceResponse.json();
      // Save JSON.
      await userApi.saveStorageJson('saved-linking', `${link.resource_id}/${linkHash(link.uri)}.json`, json, true);
      // Update link.
      const newFetchedLink = await updateConvertedLink('saved-linking', 'json');

      context.response.body = {
        link: newFetchedLink,
      };
      return;
    }
  }
};
