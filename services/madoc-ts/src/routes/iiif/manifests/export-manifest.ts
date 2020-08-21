import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';
import * as fs from 'fs';

const gatewayHost = process.env.GATEWAY_HOST || 'http://localhost:8888';

export const exportManifest: RouteMiddleware<{ id: string; slug: string }> = async context => {
  const manifestId = context.params.id;
  const siteSlug = context.params.slug;

  const file = await context.connection.one(
    sql<{
      source: string;
      local_source: string;
    }>`select source, local_source from iiif_resource where id = ${manifestId}`
  );

  if (!file.local_source) {
    throw new Error('Not found');
  }

  const fileContent = fs.readFileSync(file.local_source);

  const rawManifest = JSON.parse(fileContent.toString('utf-8'));

  context.set('Access-Control-Allow-Origin', '*');

  rawManifest.service = rawManifest.service ? rawManifest.service : [];
  rawManifest.service.push({
    '@context': 'http://iiif.io/api/search/0/context.json',
    '@id': `${gatewayHost}/s/${siteSlug}/madoc/api/manifests/${manifestId}/search/1.0`,
    profile: 'http://iiif.io/api/search/0/search',
    label: 'Search within',
    service: {
      '@id': 'https://wellcomelibrary.org/annoservices/autocomplete/b18035723',
      profile: 'http://iiif.io/api/search/0/autocomplete',
      label: 'Get suggested words in this manifest',
    },
  });
  // rawManifest.service.push({
  //   '@context': 'http://iiif.io/api/search/0/context.json',
  //   '@id': 'https://wellcomelibrary.org/annoservices/search/b18035723',
  //   profile: 'http://iiif.io/api/search/0/search',
  //   label: 'Search within this manifest',
  //   service: {
  //     '@id': 'https://wellcomelibrary.org/annoservices/autocomplete/b18035723',
  //     profile: 'http://iiif.io/api/search/0/autocomplete',
  //     label: 'Get suggested words in this manifest',
  //   },
  // });

  context.response.body = rawManifest;
};
