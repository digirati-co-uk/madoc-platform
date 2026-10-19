import { annotationPagePresentation2 } from '../../../iiif/annotation-document';
import { RouteMiddleware } from '../../../types/route-middleware';
import { getAnnotationPage, requireIIIFResource } from '../../../repository/iiif-annotations';
import { NotFound } from '../../../utility/errors/not-found';
import { setManifestCorsHeaders } from '../../site/site-manifest-build';
import { gatewayHost } from '../../../gateway/api.server';
import { remapAnnotationTargets, mergeExtraProperties } from '../../../iiif/export-properties';
import { JsonObject } from '../../../iiif/types';

export const getStoredAnnotationPage: RouteMiddleware<{
  slug: string;
  id: string;
  pageId: string;
  version: string;
}> = async context => {
  const siteId = context.state.site?.id;
  if (!siteId) throw new NotFound();
  const admin = context.state.jwt?.site.id === siteId && !!context.state.jwt?.scope.includes('site.admin');
  const resourceId = Number(context.params.id);
  const resource = await requireIIIFResource(context.connection, siteId, resourceId, admin);
  const page = await getAnnotationPage(context.connection, siteId, resourceId, Number(context.params.pageId));
  const version = context.params.version;
  if (!page.properties.document || !['3.0', 'source', '2.1', 'normalized'].includes(version)) throw new NotFound();
  const baseUrl = `${gatewayHost}/s/${context.params.slug}`;
  const id = `${baseUrl}/madoc/api/resources/${resourceId}/annotations/${page.id}/${version}`;
  let document = page.properties.document;
  if (resource.resource_type === 'manifest' && version !== 'source') {
    document = remapAnnotationTargets(
      document,
      resource.source,
      `${baseUrl}/madoc/api/manifests/${resourceId}/export/${version}`
    );
  }
  document = mergeExtraProperties(
    { ...document, id, '@context': 'http://iiif.io/api/presentation/3/context.json' },
    { '@context': document['@context'] }
  );
  if (version === '2.1') {
    document = annotationPagePresentation2(document);
  }
  setManifestCorsHeaders(context);
  context.set('Cache-Control', 'no-cache');
  context.body = document;
};
