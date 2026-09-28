import { convertGoogleVision, convertOcr, convertPlaintext } from '../../src/routes/ocr/convert-ocr';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('OCR conversion', () => {
  test('ALTO words keep their text and boxes', () => {
    const result = convertOcr('<alto><Layout><Page><TextBlock HPOS="1" VPOS="2" WIDTH="30" HEIGHT="40"><TextLine><String CONTENT="Hello" HPOS="3" VPOS="4" WIDTH="5" HEIGHT="6"/></TextLine></TextBlock></Page></Layout></alto>', 'mets-alto');
    expect(result.paragraph[0].properties.lines?.[0].properties.text?.[0]).toMatchObject({
      type: 'text-field', value: 'Hello', selector: { state: { x: 3, y: 4, width: 5, height: 6 } },
    });
  });

  test('hOCR words keep their text and boxes', () => {
    const result = convertOcr('<html><body><p class="ocr_par" title="bbox 1 2 40 50"><span class="ocr_line"><span class="ocrx_word" title="bbox 3 4 8 10">Hello</span></span></p></body></html>', 'hocr');
    expect(result.paragraph[0].properties.lines?.[0].properties.text?.[0]).toMatchObject({
      type: 'text-field', value: 'Hello', selector: { state: { x: 3, y: 4, width: 5, height: 6 } },
    });
  });

  test('plaintext is grouped into lines and words', () => {
    expect(convertPlaintext('one two\nthree').paragraph[0].properties.lines?.[0].properties.text?.map(word => word.value))
      .toEqual(['one', 'two']);
  });

  test('Google Vision symbols form words', () => {
    const result = convertGoogleVision({ fullTextAnnotation: { pages: [{ blocks: [{ paragraphs: [{ words: [{
      symbols: [{ text: 'H' }, { text: 'i' }],
      boundingBox: { vertices: [{ x: 1, y: 2 }, {}, { x: 6, y: 8 }] },
    }] }] }] }] } });
    expect(result.paragraph[0].properties.lines?.[0].properties.text?.[0]).toMatchObject({
      value: 'Hi', selector: { state: { x: 1, y: 2, width: 5, height: 6 } },
    });
  });

  test.each([
    ['hocr.html', 'hocr'],
    ['alto.xml', 'mets-alto'],
  ] as const)('converts an Okra %s fixture', (file, format) => {
    const source = readFileSync(join(__dirname, '../fixtures/ocr', file), 'utf8');
    const paragraphs = convertOcr(source, format).paragraph;
    expect(paragraphs.length).toBeGreaterThan(0);
    expect(paragraphs.flatMap(paragraph => paragraph.properties.lines || [])
      .flatMap(line => line.properties.text || []).length).toBeGreaterThan(0);
  });
});
