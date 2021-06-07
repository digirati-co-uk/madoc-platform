import { gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getActivityStreamPage: RouteMiddleware<{
  primaryStream: string;
  secondaryStream?: string;
  page: string;
  slug?: string;
}> = async context => {
  // At least for now.
  const slug = context.params.slug;
  const siteId = slug
    ? (await context.omeka.getSiteIdBySlug(slug))?.id
    : optionalUserWithScope(context, ['site.view']).siteId;
  const { primaryStream, secondaryStream } = context.params;

  if (!siteId) {
    throw new NotFound();
  }

  const perPage = 10;
  const page = Number(context.params.page);
  const [totalItems, orderedItems] = await Promise.all([
    context.changeDiscovery.getTotalItems({ primaryStream, secondaryStream }, siteId),
    context.changeDiscovery.getActivity({ primaryStream, secondaryStream }, { page, perPage }, siteId),
  ]);

  const baseUrl = slug
    ? `${gatewayHost}/s/${slug}/madoc/api/activity/${primaryStream}${
        secondaryStream ? '/stream/' + secondaryStream : ''
      }`
    : `${gatewayHost}/api/madoc/activity/${primaryStream}${secondaryStream ? '/stream/' + secondaryStream : ''}`;
  const hasNextPage = totalItems < page * perPage;
  const hasPrevPage = page > 0;

  if (Number.isNaN(page)) {
    throw new NotFound();
  }

  context.response.body = {
    '@context': 'http://iiif.io/api/discovery/1/context.json',
    id: `${baseUrl}/page/${page}`,
    type: 'OrderedCollectionPage',
    partOf: {
      id: 'https://example.org/activity/all-changes',
      type: 'OrderedCollection',
    },
    prev: hasPrevPage
      ? {
          id: `${baseUrl}/page/${page - 1}`,
          type: 'OrderedCollectionPage',
        }
      : undefined,
    next: hasNextPage
      ? {
          id: `${baseUrl}/page/${page + 1}`,
          type: 'OrderedCollectionPage',
        }
      : undefined,
    orderedItems: orderedItems.map(item => {
      item.id = `${baseUrl}/activity/${item.id}`;
      return item;
    }),
  };
};
