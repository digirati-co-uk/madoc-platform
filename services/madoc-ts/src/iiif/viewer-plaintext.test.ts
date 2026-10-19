import { getCanvasPlaintext, loadCanvasPlaintext } from '../routes/iiif/canvases/get-canvas-plaintext';
import { fetchAnnotationResource } from './fetch-annotation-page';
import { getAnnotationPlaintext, requireIIIFResource } from '../repository/iiif-annotations';
import { api } from '../gateway/api.server';

jest.mock('../gateway/api.server', () => ({ api: { asUser: jest.fn() } }));
jest.mock('../repository/iiif-annotations', () => ({
  requireIIIFResource: jest.fn(),
  getAnnotationPlaintext: jest.fn(),
}));
jest.mock('./fetch-annotation-page', () => ({ fetchAnnotationResource: jest.fn() }));
jest.mock('../utility/user-with-scope', () => ({ optionalUserWithScope: () => ({ siteId: 1 }) }));

const linking = jest.fn();
const fetchText = fetchAnnotationResource as jest.Mock;

async function request() {
  const context = {
    params: { id: '12' },
    state: {},
    disposableApis: [],
    connection: {},
    captureModels: { listCaptureModels: jest.fn().mockResolvedValue([]) },
    response: {},
  };
  await getCanvasPlaintext(context as unknown as Parameters<typeof getCanvasPlaintext>[0], async () => {});
  return (context.response as { body: { found: boolean; transcription?: string; source?: string } }).body;
}

beforeEach(() => {
  jest.clearAllMocks();
  (api.asUser as jest.Mock).mockReturnValue({ getCanvasLinking: linking });
  (getAnnotationPlaintext as jest.Mock).mockResolvedValue([]);
});

test('loads external plaintext seeAlso links through the protected fetcher', async () => {
  linking.mockResolvedValue({
    linking: [{ property: 'seeAlso', link: { id: 'https://example.org/text', format: 'text/plain' } }],
  });
  fetchText.mockResolvedValue('<b>Literal text</b>\nSecond line');
  expect(await request()).toEqual({
    found: true,
    transcription: '<b>Literal text</b>\nSecond line',
    source: 'https://example.org/text',
  });
  expect(fetchText).toHaveBeenCalledWith('https://example.org/text');
});

test('an unavailable remote plaintext link still allows annotation plaintext to appear', async () => {
  linking.mockResolvedValue({
    linking: [{ property: 'seeAlso', link: { id: 'https://example.org/missing', format: 'text/plain' } }],
  });
  fetchText.mockRejectedValue(new Error('404'));
  (getAnnotationPlaintext as jest.Mock).mockResolvedValue([{ text: 'Stored OCR', source: 'page' }]);
  expect(await request()).toMatchObject({ found: true, transcription: 'Stored OCR', source: 'page' });
});

test('does not treat non-plaintext seeAlso properties as transcriptions', async () => {
  linking.mockResolvedValue({
    linking: [{ property: 'seeAlso', link: { id: 'https://example.org/alto', format: 'text/xml' } }],
  });
  expect(await request()).toMatchObject({ found: false });
  expect(fetchText).not.toHaveBeenCalled();
});

test('an internal service client does not elevate public plaintext publication checks', async () => {
  linking.mockResolvedValue({ linking: [] });
  const context = {
    connection: {},
    disposableApis: [],
    captureModels: { listCaptureModels: jest.fn().mockResolvedValue([]) },
  };
  await loadCanvasPlaintext(context as unknown as Parameters<typeof loadCanvasPlaintext>[0], 1, 12, false);
  expect(requireIIIFResource).toHaveBeenCalledWith(context.connection, 1, 12, false);
  expect(getAnnotationPlaintext).toHaveBeenCalledWith(context.connection, 1, 12, false);
});
