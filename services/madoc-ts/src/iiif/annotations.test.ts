import { extraProperties, presentation3 } from './properties';
import { mergeExtraProperties, remapAnnotationTargets } from './export-properties';
import {
  normalizePage,
  annotationTextSources,
  groupAnnotationText,
  annotationPagePresentation2,
} from './annotation-document';

const canvas = 'https://example.org/canvas';
const page = {
  id: 'https://example.org/page',
  type: 'AnnotationPage',
  items: [
    {
      id: 'https://example.org/a',
      type: 'Annotation',
      motivation: 'supplementing',
      target: `${canvas}#xywh=1,2,3,4`,
      body: { type: 'TextualBody', value: 'First line', language: 'en', format: 'text/plain' },
    },
  ],
};

test('preserves extensions, ranges, and technical fields without overriding managed data', () => {
  const extras = extraProperties({
    id: 'old',
    type: 'Manifest',
    label: { en: ['old'] },
    items: [],
    annotations: [],
    navDate: '1900-01-01T00:00:00Z',
    behavior: ['paged'],
    structures: [{ id: 'range', type: 'Range' }],
    navPlace: { type: 'FeatureCollection', features: [] },
    custom: { nested: [1, 2] },
  });
  const merged = mergeExtraProperties(
    { id: 'new', label: { en: ['edited'] }, items: ['edited'] },
    { ...extras, id: 'old', label: 'old' }
  );
  expect(merged).toMatchObject({
    id: 'new',
    label: { en: ['edited'] },
    items: ['edited'],
    behavior: ['paged'],
    structures: [{ id: 'range' }],
    custom: { nested: [1, 2] },
  });
  expect(extras).not.toHaveProperty('annotations');
});

test('retains extension contexts', () => {
  expect(
    mergeExtraProperties({ '@context': 'iiif' }, { '@context': ['iiif', { custom: 'https://example.org/custom' }] })[
      '@context'
    ]
  ).toEqual(['iiif', { custom: 'https://example.org/custom' }]);
});

test('extracts ordered text for canvas fragments and SpecificResources, excluding comments and HTML', () => {
  const normalized = normalizePage(
    {
      ...page,
      items: [
        ...page.items,
        {
          ...page.items[0],
          target: {
            type: 'SpecificResource',
            source: { id: canvas, type: 'Canvas' },
            selector: { type: 'FragmentSelector', value: 'xywh=0,0,1,1' },
          },
          body: { type: 'TextualBody', value: 'Second line', language: 'en' },
        },
        { ...page.items[0], motivation: 'commenting', body: { type: 'TextualBody', value: 'Comment' } },
        { ...page.items[0], body: { type: 'TextualBody', value: '<p>HTML</p>', format: 'text/html' } },
      ],
    },
    page.id
  );
  const text = groupAnnotationText(annotationTextSources(normalized), new Map([[canvas, 12]]));
  expect(text).toEqual([{ canvasId: 12, text: 'First line\nSecond line', language: 'en' }]);
});

test('normalizes Presentation 2 text lists and exports them back to otherContent format', () => {
  const normalized = normalizePage(
    {
      '@context': 'http://iiif.io/api/presentation/2/context.json',
      '@id': page.id,
      '@type': 'sc:AnnotationList',
      resources: [
        {
          '@id': 'https://example.org/a',
          '@type': 'oa:Annotation',
          motivation: 'sc:painting',
          on: canvas,
          resource: { '@type': 'cnt:ContentAsText', chars: 'OCR text', format: 'text/plain' },
        },
      ],
    },
    page.id
  );
  expect(annotationTextSources(normalized)).toMatchObject([{ canvasSource: canvas, text: 'OCR text' }]);
  expect(annotationPagePresentation2(normalized)).toMatchObject({
    '@type': 'sc:AnnotationList',
    resources: [{ resource: { chars: 'OCR text' } }],
  });
});

test('upgrades v2 otherContent and ranges into properties for import', () => {
  const upgraded = presentation3({
    '@context': 'http://iiif.io/api/presentation/2/context.json',
    '@id': 'https://example.org/m',
    '@type': 'sc:Manifest',
    label: 'Manifest',
    customManifest: { retained: true },
    sequences: [
      {
        '@id': 'https://example.org/sequence',
        '@type': 'sc:Sequence',
        canvases: [
          {
            '@id': canvas,
            '@type': 'sc:Canvas',
            label: 'Canvas',
            customCanvas: { retained: true },
            width: 10,
            height: 10,
            images: [],
            otherContent: [{ '@id': page.id, '@type': 'sc:AnnotationList' }],
          },
        ],
      },
    ],
    structures: [{ '@id': 'https://example.org/r', '@type': 'sc:Range', label: 'Chapter', canvases: [canvas] }],
  });
  expect(upgraded).toMatchObject({
    type: 'Manifest',
    customManifest: { retained: true },
    items: [{ customCanvas: { retained: true }, annotations: [{ id: page.id, type: 'AnnotationPage' }] }],
    structures: [{ type: 'Range' }],
  });
});

test('extracts embedded v2 text after upgrading the containing manifest', () => {
  const upgraded = presentation3({
    '@id': 'https://example.org/m',
    '@type': 'sc:Manifest',
    label: 'Manifest',
    sequences: [
      {
        '@type': 'sc:Sequence',
        canvases: [
          {
            '@id': canvas,
            '@type': 'sc:Canvas',
            label: 'Canvas',
            width: 10,
            height: 10,
            images: [],
            otherContent: [
              {
                '@id': page.id,
                '@type': 'sc:AnnotationList',
                resources: [
                  {
                    '@id': 'https://example.org/a',
                    '@type': 'oa:Annotation',
                    motivation: 'sc:painting',
                    on: canvas,
                    resource: { '@type': 'cnt:ContentAsText', chars: 'Embedded OCR', format: 'text/plain' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  const importedCanvas = (upgraded.items as Record<string, unknown>[])[0];
  const embedded = (importedCanvas.annotations as Record<string, unknown>[])[0];
  expect(annotationTextSources(normalizePage(embedded, page.id))).toMatchObject([{ text: 'Embedded OCR' }]);
});

test('remaps manifest targets without changing annotation IDs, selectors, or bodies', () => {
  const remapped = remapAnnotationTargets(page, canvas, 'https://madoc.local/export');
  expect(remapped).toMatchObject({
    items: [{ id: page.items[0].id, target: 'https://madoc.local/export#xywh=1,2,3,4', body: page.items[0].body }],
  });
  expect(page.items[0].target).toBe(`${canvas}#xywh=1,2,3,4`);
});

test('keeps derived remote plaintext separate from the annotation document', () => {
  const document = {
    ...page,
    items: [{ ...page.items[0], body: { id: 'https://example.org/text', type: 'Text', format: 'text/plain' } }],
  };
  expect(annotationTextSources(document, undefined, { 'https://example.org/text': 'Remote text' })).toMatchObject([
    { text: 'Remote text' },
  ]);
  expect(document.items[0].body).not.toHaveProperty('value');
});

test('rejects malformed pages and annotations', () => {
  expect(() => normalizePage({ type: 'AnnotationPage' }, page.id)).toThrow();
  expect(() => normalizePage({ type: 'AnnotationPage', items: [{ type: 'Annotation' }] }, page.id)).toThrow();
});

test('exports canvas extensions and supplementary pages as v2 otherContent after normalization', () => {
  const { Vault } = jest.requireActual('@iiif/helpers/vault') as typeof import('@iiif/helpers/vault');
  const { presentation2Properties } = jest.requireActual('./export-properties') as typeof import('./export-properties');
  const source = {
    id: 'https://example.org/m',
    type: 'Manifest',
    label: { en: ['Test'] },
    behavior: ['paged'],
    items: [
      {
        id: canvas,
        type: 'Canvas',
        height: 10,
        width: 10,
        custom: 'preserved',
        items: [],
        annotations: [{ id: page.id, type: 'AnnotationPage' }],
      },
    ],
  };
  const vault = new Vault();
  // Vault normalizes in place, so preserve the full input for post-serialization fields.
  vault.loadSync(source.id, structuredClone(source));
  const output = presentation2Properties(
    vault.toPresentation2({ id: source.id, type: 'Manifest' }) as Record<string, unknown>,
    source
  );
  expect(output).toMatchObject({
    viewingHint: 'paged',
    sequences: [
      { canvases: [{ custom: 'preserved', otherContent: [{ '@id': page.id, '@type': 'sc:AnnotationList' }] }] },
    ],
  });
});

test('keeps normalized auxiliary-canvas references while restoring unknown properties', () => {
  const { restoreNormalizedProperties } = jest.requireActual(
    './export-properties'
  ) as typeof import('./export-properties');
  const normalized = { id: canvas, type: 'Canvas', placeholderCanvas: { id: 'placeholder', type: 'Canvas' } };
  expect(
    restoreNormalizedProperties(normalized, {
      placeholderCanvas: { id: 'placeholder', type: 'Canvas', items: [] },
      custom: 'preserved',
    })
  ).toEqual({ ...normalized, custom: 'preserved' });
});
