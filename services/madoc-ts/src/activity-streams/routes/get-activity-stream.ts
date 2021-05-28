import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { gatewayHost } from '../../gateway/api.server';

export const getActivityStream: RouteMiddleware<{
  primaryStream: string;
  secondaryStream?: string;
}> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const { primaryStream, secondaryStream } = context.params;

  const perPage = 100;
  const totalItems = await context.changeDiscovery.getTotalItems({ primaryStream, secondaryStream }, siteId);

  const firstPage = 0;
  const lastPage = Math.ceil(totalItems / perPage);
  const baseUrl = `${gatewayHost}/api/madoc/activity/${primaryStream}${
    secondaryStream ? '/stream/' + secondaryStream : ''
  }`;

  context.response.status = 200;
  context.response.body = {
    '@context': 'http://iiif.io/api/discovery/1/context.json',
    id: `${baseUrl}/changes`,
    type: 'OrderedCollection',
    totalItems: totalItems,
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
