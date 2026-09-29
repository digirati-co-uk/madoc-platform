import { randomUUID } from 'node:crypto';
import { load } from 'cheerio';
import { RouteMiddleware } from '../../types/route-middleware';

interface Box { x: number; y: number; width: number; height: number }
interface Field {
  id: string;
  type: 'entity' | 'text-field';
  label: string;
  pluralLabel: string;
  description: string;
  allowMultiple: true;
  labelledBy: string;
  properties: { lines?: Field[]; text?: Field[] };
  selector: { id: string; type: 'box-selector'; state: Box | Record<string, never> };
  value?: string;
  previewInline?: true;
}

const selector = (state: Box | Record<string, never>) => ({ id: randomUUID(), type: 'box-selector' as const, state });

function field(kind: 'paragraph' | 'line' | 'text', children: Field[] | string, bbox: Box | Record<string, never>): Field {
  const common = {
    id: randomUUID(), allowMultiple: true as const, selector: selector(bbox),
  };
  if (kind === 'text') {
    return {
      ...common, type: 'text-field', label: 'Text of line', pluralLabel: 'Text of lines',
      description: 'Single word, phrase or the whole line', labelledBy: '', properties: {},
      value: children as string, previewInline: true,
    };
  }
  if (kind === 'line') {
    return {
      ...common, type: 'entity', label: 'Line', pluralLabel: 'Lines',
      description: 'All of the lines inside of a paragraph', labelledBy: 'text',
      properties: { text: children as Field[] },
    };
  }
  return {
    ...common, type: 'entity', label: 'Paragraph', pluralLabel: 'Paragraphs',
    description: 'Region of the page denoting a single paragraph', labelledBy: 'lines',
    properties: { lines: children as Field[] },
  };
}

function altoBox(attribute: (name: string) => string | undefined): Box | Record<string, never> {
  const values = ['HPOS', 'VPOS', 'WIDTH', 'HEIGHT'].map(name => Number(attribute(name) || attribute(name.toLowerCase()) || 0));
  return values.every(value => Number.isFinite(value) && value !== 0)
    ? { x: values[0], y: values[1], width: values[2], height: values[3] }
    : {};
}

function hocrBox(title: string | undefined): Box | Record<string, never> {
  const match = /(?:^|;)\s*bbox\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/.exec(title || '');
  if (!match) return {};
  const [x, y, right, bottom] = match.slice(1).map(Number);
  return { x, y, width: right - x, height: bottom - y };
}

export function convertOcr(input: string, format: 'hocr' | 'mets-alto'): { paragraph: Field[] } {
  const $ = load(input, { xmlMode: format === 'mets-alto' });
  const paragraphs = format === 'hocr'
    ? $('.ocr_par').toArray().map(paragraph => field('paragraph', $(paragraph).find('.ocr_line, .ocrx_line').toArray().map(line =>
      field('line', $(line).find('.ocrx_word').toArray().map(word =>
        field('text', $(word).text().trim(), hocrBox($(word).attr('title')))
      ), hocrBox($(line).attr('title')))
    ), hocrBox($(paragraph).attr('title'))))
    : $('TextBlock').toArray().map(paragraph => field('paragraph', $(paragraph).find('TextLine').toArray().map(line =>
      field('line', $(line).find('String').toArray().map(word =>
        field('text', $(word).attr('CONTENT') || '', altoBox(name => $(word).attr(name)))
      ), altoBox(name => $(line).attr(name)))
    ), altoBox(name => $(paragraph).attr(name))));
  if (!paragraphs.length) throw new Error(`No ${format} OCR content found`);
  return { paragraph: paragraphs };
}

export function convertPlaintext(input: string): { paragraph: Field[] } {
  const lines = input.split(/\r?\n/).filter(line => line.trim()).map(line =>
    field('line', line.trim().split(/\s+/).map(word => field('text', word, {})), {})
  );
  if (!lines.length) throw new Error('No plaintext OCR content found');
  return { paragraph: [field('paragraph', lines, {})] };
}

interface VisionBox { vertices?: Array<{ x?: number; y?: number }> }
interface VisionWord { symbols?: Array<{ text?: string }>; boundingBox?: VisionBox }
interface VisionParagraph { words?: VisionWord[]; boundingBox?: VisionBox }
interface VisionBlock { paragraphs?: VisionParagraph[]; boundingBox?: VisionBox }
interface VisionDocument { fullTextAnnotation?: { pages?: Array<{ blocks?: VisionBlock[] }> } }

function visionBox(box?: VisionBox): Box | Record<string, never> {
  const topLeft = box?.vertices?.[0];
  const bottomRight = box?.vertices?.[2];
  if (!topLeft || !bottomRight) return {};
  return {
    x: topLeft.x || 0, y: topLeft.y || 0,
    width: (bottomRight.x || 0) - (topLeft.x || 0),
    height: (bottomRight.y || 0) - (topLeft.y || 0),
  };
}

export function convertGoogleVision(input: VisionDocument): { paragraph: Field[] } {
  const blocks = input.fullTextAnnotation?.pages?.[0]?.blocks;
  if (!blocks?.length) throw new Error('No Google Vision OCR content found');
  return { paragraph: blocks.map(block => field('paragraph', (block.paragraphs || []).map(paragraph =>
    field('line', (paragraph.words || []).map(word =>
      field('text', (word.symbols || []).map(symbol => symbol.text || '').join(''), visionBox(word.boundingBox))
    ), visionBox(paragraph.boundingBox))
  ), visionBox(block.boundingBox))) };
}

export const convertOcrRoute: RouteMiddleware<{ format: string }, { ocr_data: unknown }> = async context => {
  const format = context.params.format;
  const input = context.requestBody?.ocr_data;
  if (!['hocr', 'mets-alto', 'plaintext', 'google-vision'].includes(format) ||
      (format === 'google-vision' ? !input || typeof input !== 'object' : typeof input !== 'string' || !input.trim())) {
    context.status = 400;
    context.body = { error: 'Expected a supported OCR format and nonempty ocr_data' };
    return;
  }
  try {
    if (format === 'google-vision') {
      context.body = convertGoogleVision(input as VisionDocument);
    } else if (format === 'plaintext') {
      context.body = convertPlaintext(input as string);
    } else {
      context.body = convertOcr(input as string, format as 'hocr' | 'mets-alto');
    }
  } catch (error) {
    context.status = 400;
    context.body = { error: error instanceof Error ? error.message : 'Invalid OCR' };
  }
};
