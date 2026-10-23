import { siteCanvas } from '../routes/site/site-canvas';
import { getCanvasAnnotationPages } from '../repository/iiif-annotations';
import { loadCanvasPlaintext } from '../routes/iiif/canvases/get-canvas-plaintext';

jest.mock('../repository/iiif-annotations', () => ({ getCanvasAnnotationPages: jest.fn() }));
jest.mock('../routes/iiif/canvases/get-canvas-plaintext', () => ({ loadCanvasPlaintext: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  (getCanvasAnnotationPages as jest.Mock).mockResolvedValue([]);
  (loadCanvasPlaintext as jest.Mock).mockResolvedValue({ found: false });
});

test.each([
  ['anonymous', undefined, false],
  ['another site administrator', { site: { id: 2 }, scope: ['site.admin'] }, false],
  ['site reader', { site: { id: 1 }, scope: ['site.view'] }, false],
  ['site administrator', { site: { id: 1 }, scope: ['site.admin'] }, true],
])('preserves publication policy for %s when loading annotations and plaintext', async (_name, jwt, admin) => {
  const context = {
    params: { id: '12' },
    query: { annotations: 'true', plaintext: 'true' },
    state: { site: { id: 1 }, jwt, siteApi: { getCanvasById: jest.fn().mockResolvedValue({ canvas: { id: 12 } }) } },
    connection: {},
    response: {},
  };
  await siteCanvas(context as unknown as Parameters<typeof siteCanvas>[0], async () => {});
  expect(getCanvasAnnotationPages).toHaveBeenCalledWith(context.connection, 1, 12, admin);
  expect(loadCanvasPlaintext).toHaveBeenCalledWith(context, 1, 12, admin);
});
