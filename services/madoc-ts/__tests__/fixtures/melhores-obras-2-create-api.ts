import { piscina } from './piscina';
import { api }s from '../../src/gateway/api.server';
import { melhoresObras } from './melhores-obras-2';

export async function melhoresApi() {
  const site = await api.system.createSite({
    slug: 'melhores-obras',
    title: 'Melhores Obras',
  });

  const manifest = await api.asUser({ siteId: site.id }).importManifest(melhoresObras.id);

  return {
    site,
    manifest,
    teardown: async () => {
      await api.system.deleteSite(site.id);
    },
  };
}
