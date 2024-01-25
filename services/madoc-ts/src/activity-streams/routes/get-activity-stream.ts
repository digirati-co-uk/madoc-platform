import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { gatewayHost } from '../../gateway/api.server';
import { ACTIVITY_PER_PAGE } from '../activity-stream-config';

export const getActivityStream: RouteMiddleware<{
  primaryStream: string;
  secondaryStream?: string;
  slug?: string;
}> = async context => {
  const slug = context.params.slug;
  const siteId = slug
    ? (await context.siteManager.getSiteBySlug(slug))?.id
    : optionalUserWithScope(context, ['site.view']).siteId;
  const { primaryStream, secondaryStream } = context.params;

  if (!siteId) {
    throw new NotFound();
  }

  const perPage = ACTIVITY_PER_PAGE;
  const totalItems = await context.changeDiscovery.getTotalItems({ primaryStream, secondaryStream }, siteId);

  const firstPage = 0;
  const lastPage = Math.ceil(totalItems / perPage) - 1; // Math.ceil to get total NUMBER of pages, -1 to account for zero-index.
  const baseUrl = slug
    ? `${gatewayHost}/s/${slug}/madoc/api/activity/${primaryStream}${
        secondaryStream ? '/stream/' + secondaryStream : ''
      }`
    : `${gatewayHost}/api/madoc/activity/${primaryStream}${secondaryStream ? '/stream/' + secondaryStream : ''}`;

  context.response.status = 200;
  context.response.body = {
    '@context': 'http://iiif.io/api/discovery/1/context.json',
    id: `${baseUrl}/changes`,
    type: 'OrderedCollection',
    totalItems: totalItems,
    totalPages: lastPage + 1,
    rights: 'http://creativecommons.org/licenses/by/4.0/',
    partOf: secondaryStream
      ? [
          {
            id: `${gatewayHost}/api/madoc/activity/${primaryStream}`,
            type: 'OrderedCollection',
          },
        ]
      : undefined,
    first: {
      id: `${baseUrl}/page/${firstPage}`,
      type: 'OrderedCollectionPage',
    },
    last: {
      id: `${baseUrl}/page/${lastPage}`,
      type: 'OrderedCollectionPage',
    },
  };
};
