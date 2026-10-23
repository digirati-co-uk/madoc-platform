import { AnnotationPage } from '@iiif/presentation-3';
import { canvasAnnotationPage } from './canvas-annotations';
import { annotationPageToRegions } from '../frontend/shared/utility/annotation-page-to-regions';

const source = 'https://example.org/canvas';
const canvas = { source_id: source, width: 1000, height: 2000 };
const annotation = {
  id: 'https://example.org/annotation',
  type: 'Annotation',
  target: `${source}#xywh=10,20,30,40`,
  body: { type: 'TextualBody', value: 'First line' },
};

test('does not turn unsupported SVG or malformed selectors into whole-canvas regions', () => {
  const page = {
    id: 'page',
    type: 'AnnotationPage',
    items: [
      {
        ...annotation,
        target: { type: 'SpecificResource', source, selector: { type: 'SvgSelector', value: '<svg />' } },
      },
      {
        ...annotation,
        target: { type: 'SpecificResource', source, selector: { type: 'FragmentSelector', value: 'invalid' } },
      },
    ],
  };
  expect(annotationPageToRegions(page as unknown as AnnotationPage, canvas)).toEqual([]);
});

test('projects only the current canvas from manifest pages and hydrates stored text without changing the snapshot', () => {
  const document = {
    id: 'https://example.org/page',
    type: 'AnnotationPage',
    items: [
      annotation,
      { ...annotation, id: 'other', target: 'https://example.org/other#xywh=1,2,3,4' },
      {
        ...annotation,
        id: 'remote',
        target: {
          type: 'SpecificResource',
          source: { id: source, type: 'Canvas' },
          selector: { type: 'FragmentSelector', value: 'xywh=1,2,3,4' },
        },
        body: { id: 'https://example.org/text', type: 'Text', format: 'text/plain' },
      },
    ],
  };
  const projected = canvasAnnotationPage(document, source, { 'https://example.org/text': 'Remote line' });
  expect(projected).toMatchObject({ items: [{ id: annotation.id }, { id: 'remote', body: { value: 'Remote line' } }] });
  expect(document.items[2].body).not.toHaveProperty('value');
  expect(annotationPageToRegions(projected as unknown as AnnotationPage, canvas)).toMatchObject([
    { label: 'First line', target: { x: 10, y: 20, width: 30, height: 40 } },
    { label: 'Remote line', target: { x: 1, y: 2, width: 3, height: 4 } },
  ]);
});

test('supports whole-canvas, percent selectors, body arrays and preserves Madoc selector IDs', () => {
  const page = {
    id: 'page',
    type: 'AnnotationPage',
    items: [
      {
        ...annotation,
        'madoc:selectorId': 'selector',
        body: [
          { type: 'TextualBody', value: 'One' },
          { type: 'TextualBody', value: 'Two' },
        ],
      },
      { ...annotation, id: 'whole', target: source },
      { ...annotation, id: 'array', target: ['https://example.org/other', source] },
      {
        ...annotation,
        id: 'percent',
        target: {
          type: 'SpecificResource',
          source,
          selector: { type: 'FragmentSelector', value: 'xywh=percent:10,20,30,40' },
        },
      },
      { ...annotation, id: 'other', target: 'https://example.org/other' },
    ],
  };
  expect(annotationPageToRegions(page as unknown as AnnotationPage, canvas)).toMatchObject([
    { id: 'selector', label: 'One\nTwo', target: { x: 10, y: 20, width: 30, height: 40 } },
    { id: 'whole', target: { x: 0, y: 0, width: 1000, height: 2000 } },
    { id: 'array', target: { x: 0, y: 0, width: 1000, height: 2000 } },
    { id: 'percent', target: { x: 100, y: 400, width: 300, height: 800 } },
  ]);
});

test('does not invent regions for another canvas or missing geometry', () => {
  expect(annotationPageToRegions(undefined)).toEqual([]);
  expect(
    annotationPageToRegions({
      type: 'AnnotationPage',
      id: 'page',
      items: [{ ...annotation, target: source }],
    } as AnnotationPage)
  ).toEqual([]);
});
