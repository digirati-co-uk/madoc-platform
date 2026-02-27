import { importManifest } from '../../src/routes/iiif-import/import';
import { api } from '../../src/gateway/api.server';
import { melhoresApi } from '../fixtures/melhores-obras-2-create-api';
import { piscina } from '../fixtures/piscina';

describe('Import annotations', () => {
  test('Test that annotations are imported', async () => {
    const { teardown, site } = await melhoresApi();

    const manifestTask = await api.asUser({ siteId: site.id }).importManifest(piscina.id);
    await api.wrapTask(Promise.resolve(manifestTask), () => Promise.resolve());

    const manifest = await api.asUser({ siteId: site.id }).getManifestById(1);

    expect(manifest.manifest.items[0].annotations).toBeDefined();
    expect(manifest.manifest.items[0].annotations.length).toBe(1);
    expect(manifest.manifest.items[0].annotations[0].id).toBe('https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/annotation/1');

    await teardown();
  });
});
