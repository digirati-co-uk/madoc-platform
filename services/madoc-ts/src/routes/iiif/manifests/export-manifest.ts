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
  });

  const canvasList = rawManifest.sequences ? rawManifest?.sequences[0].canvases : rawManifest?.items;
  if (canvasList) {
    const canvasIds = [];
    for (const canvas of canvasList) {
      const id = canvas['@id'] || canvas.id;
      if (id) {
        canvasIds.push(id);
      }
    }

    // @todo factor in the site and structure to filter ids removed.
    const idMap = await context.connection.any(sql<{ id: number; source: string }>`
        select id, source
        from iiif_resource
        where source = any (${sql.array(canvasIds, 'text')})
    `);
    const idMapping: { [source: string]: number } = {};
    for (const id of idMap) {
      idMapping[id.source] = id.id;
    }

    for (const canvas of canvasList) {
      const id = canvas['@id'] || canvas.id;
      if (!id || !idMapping[id]) continue;
      if (!canvas.otherContent) {
        canvas.otherContent = [];
      }
      if (!Array.isArray(canvas.otherContent)) {
        canvas.otherContent = [canvas.otherContent];
      }
      // @todo on a per-project basis.
      canvas.otherContent.push({
        '@id': `${gatewayHost}/s/default/madoc/api/canvases/${idMapping[id]}/models?format=open-annotation&selectors=true`,
        id: `${gatewayHost}/s/default/madoc/api/canvases/${idMapping[id]}/models?format=open-annotation&selectors=true`,
        '@type': 'sc:AnnotationList',
        label: 'Annotations',
      });
    }

    if (rawManifest.sequences) {
      rawManifest.sequences[0].canvases = rawManifest.sequences[0].canvases.filter((canvas: any) => {
        const id = canvas['@id'] || canvas.id;
        return id && idMapping[id];
      });
    }

    if (rawManifest.items) {
      rawManifest.items = rawManifest.sequences[0].canvases.filter((canvas: any) => {
        const id = canvas['@id'] || canvas.id;
        return id && idMapping[id];
      });
    }
  }

  context.response.body = rawManifest;
};
