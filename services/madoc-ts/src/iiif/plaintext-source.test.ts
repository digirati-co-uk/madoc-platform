import { plainTextSource } from '../extensions/capture-models/DynamicDataSources/sources/Plaintext.source';

const loader = plainTextSource.loader;
type LoaderParameters = Parameters<typeof loader>;

function inputs(type = 'text-field') {
  const field = { id: 'field', type, value: '' } as LoaderParameters[0];
  const canvas = { id: 12 } as LoaderParameters[2];
  const api = {
    getCanvasLinking: jest.fn().mockResolvedValue({ linking: [] }),
    getCanvasPlaintext: jest.fn().mockResolvedValue({ found: true, transcription: '<b>Literal text</b>\nNext line' }),
  };
  return { field, canvas, api };
}

test('prefills transcription fields from detected annotation plaintext when no plaintext link exists', async () => {
  const { field, canvas, api } = inputs();
  const result = await loader(field, 'transcription', canvas, api as unknown as LoaderParameters[3]);
  expect(result.value).toBe('<b>Literal text</b>\nNext line');
  expect(api.getCanvasPlaintext).toHaveBeenCalledWith(12);
});

test('treats plaintext as literal text when prefilling an HTML field', async () => {
  const { field, canvas, api } = inputs('html-field');
  const result = await loader(field, 'transcription', canvas, api as unknown as LoaderParameters[3]);
  expect(result.value).toBe('&lt;b&gt;Literal text&lt;/b&gt;<br />Next line');
});
