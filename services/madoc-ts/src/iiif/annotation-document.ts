import { presentation2Label } from './export-properties';
import { RequestError } from '../utility/errors/request-error';
import { Vault } from '@iiif/helpers/vault';
import { AnnotationPage } from '@iiif/presentation-3';
import { AnnotationText, JsonObject } from './types';
import { identifier, object } from './properties';

export function normalizePage(input: JsonObject, fallbackId: string): JsonObject {
  if (!object(input) || Buffer.byteLength(JSON.stringify(input)) > 10 * 1024 * 1024)
    throw new RequestError('Annotation page must be a JSON object under 10MB');
  const id = identifier(input) || fallbackId;
  if (input.type === 'AnnotationPage') {
    if (!Array.isArray(input.items)) throw new RequestError('AnnotationPage.items must be an array');
    for (const annotation of input.items) {
      if (!object(annotation) || annotation.type !== 'Annotation' || !annotation.target) {
        throw new RequestError('Each annotation must have type Annotation and a target');
      }
    }
    return {
      ...input,
      id,
      items: input.items.map((annotation, index) => ({
        ...(annotation as JsonObject),
        id: identifier(annotation) || `${id}/annotation/${index}`,
        body: normalizeTextBody((annotation as JsonObject).body),
      })),
    };
  }
  if (input['@type'] === 'sc:AnnotationList' && Array.isArray(input.resources)) {
    const vault = new Vault();
    vault.loadSync(id, input);
    const page = vault.toPresentation3<AnnotationPage>({ id, type: 'AnnotationPage' }) as unknown as JsonObject;
    return normalizePage(page, id);
  }
  throw new RequestError('Expected an AnnotationPage or Presentation 2 AnnotationList');
}

// Whole-manifest upgrades can already be P3 while still retaining P2 text bodies.
function normalizeTextBody(body: unknown): unknown {
  if (Array.isArray(body)) return body.map(normalizeTextBody);
  if (!object(body) || typeof body.chars !== 'string') return body;
  const { chars, ...properties } = body;
  return { ...properties, type: 'TextualBody', value: chars };
}

function targets(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(targets);
  if (object(value) && value.type === 'SpecificResource') return targets(value.source);
  const id = identifier(value);
  return id ? [id.split('#')[0]] : [];
}

export interface TextSource {
  canvasSource: string;
  text: string;
  language: string;
}

export function annotationTextSources(
  page: JsonObject,
  defaultCanvas?: string,
  textBodies: Record<string, string> = {}
): TextSource[] {
  const output: TextSource[] = [];
  for (const annotation of Array.isArray(page.items) ? page.items : []) {
    if (!object(annotation)) continue;
    const motivations = Array.isArray(annotation.motivation) ? annotation.motivation : [annotation.motivation];
    if (
      !motivations.some(
        motivation => motivation === 'supplementing' || motivation === 'transcribing' || motivation === 'painting'
      )
    )
      continue;
    const canvasSources = targets(annotation.target);
    if (!canvasSources.length && defaultCanvas) canvasSources.push(defaultCanvas);
    for (const body of Array.isArray(annotation.body) ? annotation.body : [annotation.body]) {
      if (!object(body)) continue;
      const value = typeof body.value === 'string' ? body.value : textBodies[identifier(body) || ''];
      if (typeof value !== 'string') continue;
      if (body.type !== 'TextualBody' && body.type !== 'Text') continue;
      if (body.format && body.format !== 'text/plain') continue;
      if (body.purpose && body.purpose !== 'supplementing' && body.purpose !== 'transcribing') continue;
      const language = typeof body.language === 'string' ? body.language : 'none';
      if (value.trim())
        for (const canvasSource of canvasSources) {
          output.push({ canvasSource, text: value, language });
        }
    }
  }
  return output;
}

export function groupAnnotationText(sources: TextSource[], canvasIds: Map<string, number>): AnnotationText[] {
  const groups = new Map<string, AnnotationText>();
  for (const source of sources) {
    const canvasId = canvasIds.get(source.canvasSource);
    if (!canvasId) continue;
    const key = `${canvasId}:${source.language}`;
    const existing = groups.get(key);
    if (existing) existing.text += `\n${source.text}`;
    else groups.set(key, { canvasId, text: source.text, language: source.language });
  }
  return [...groups.values()];
}

export function remoteTextBodies(page: JsonObject): JsonObject[] {
  return (Array.isArray(page.items) ? page.items : [])
    .filter(object)
    .filter(annotation => {
      const motivations = Array.isArray(annotation.motivation) ? annotation.motivation : [annotation.motivation];
      return motivations.some(m => m === 'supplementing' || m === 'transcribing' || m === 'painting');
    })
    .flatMap(annotation => (Array.isArray(annotation.body) ? annotation.body : [annotation.body]))
    .filter(object)
    .filter(body => !body.value && body.format === 'text/plain' && !!identifier(body));
}

// The current Vault P2 serializer drops TextualBody.value and emits P3 SpecificResources.
export function annotationPagePresentation2(page: JsonObject): JsonObject {
  const names: Record<string, string> = {
    TextualBody: 'cnt:ContentAsText',
    Text: 'dctypes:Text',
    Canvas: 'sc:Canvas',
    Image: 'dctypes:Image',
    SpecificResource: 'oa:SpecificResource',
    FragmentSelector: 'oa:FragmentSelector',
    SvgSelector: 'oa:SvgSelector',
  };
  function convert(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(convert);
    if (!object(value)) return value;
    const { id, type, value: text, source, ...rest } = value;
    return {
      ...rest,
      ...(id ? { '@id': id } : {}),
      ...(typeof type === 'string' ? { '@type': names[type] || type } : {}),
      ...(text !== undefined ? { [type === 'TextualBody' ? 'chars' : 'value']: text } : {}),
      ...(source ? { full: convert(source) } : {}),
      ...(rest.selector ? { selector: convert(rest.selector) } : {}),
    };
  }
  const annotations = (Array.isArray(page.items) ? page.items : []).filter(object).map(annotation => {
    const { id, type, body, target, motivation, ...rest } = annotation;
    const motivations = Array.isArray(motivation) ? motivation : [motivation];
    const converted = motivations
      .filter((m): m is string => typeof m === 'string')
      .map(m => (m.includes(':') ? m : ['painting', 'supplementing'].includes(m) ? `sc:${m}` : `oa:${m}`));
    return {
      ...rest,
      '@id': id,
      '@type': 'oa:Annotation',
      ...(rest.label ? { label: presentation2Label(rest.label) } : {}),
      motivation: converted.length === 1 ? converted[0] : converted,
      resource: convert(body),
      on: convert(target),
    };
  });
  const { id, type, items, ...rest } = page;
  const contexts = [page['@context']]
    .flat(2)
    .filter(
      context => context && !(typeof context === 'string' && /^https?:\/\/iiif.io\/api\/presentation\//.test(context))
    );
  return {
    ...rest,
    '@context': contexts.length
      ? ['http://iiif.io/api/presentation/2/context.json', ...contexts]
      : 'http://iiif.io/api/presentation/2/context.json',
    '@id': id,
    '@type': 'sc:AnnotationList',
    ...(rest.label ? { label: presentation2Label(rest.label) } : {}),
    resources: annotations,
  };
}
