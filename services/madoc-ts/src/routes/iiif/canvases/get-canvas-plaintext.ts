import { getAnnotationPlaintext, requireIIIFResource } from '../../../repository/iiif-annotations';
import {
  paragraphsToPlaintext,
  PARAGRAPHS_PROFILE,
} from '../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { traverseDocument } from '../../../frontend/shared/capture-models/helpers/traverse-document';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware, ServerContext } from '../../../types/route-middleware';
import { isLinkCaptureModelParagraphs, isLinkPlaintext } from '../../../utility/linking-property-types';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { fetchAnnotationResource } from '../../../iiif/fetch-annotation-page';

export async function loadCanvasPlaintext(
  context: Pick<ServerContext, 'connection' | 'captureModels' | 'disposableApis'>,
  siteId: number,
  canvasId: number,
  admin = false
) {
  await requireIIIFResource(context.connection, siteId, canvasId, admin);
  const siteApi = api.asUser({ siteId }, {}, true);
  context.disposableApis.push(siteApi);

  // Get all capture models.
  const models = await context.captureModels.listCaptureModels(
    {
      all: true,
      page: 1,
      perPage: 20,
      target: `urn:madoc:canvas:${canvasId}`,
    },
    siteId
  );

  const state: { found: boolean; transcription?: string; source?: string } = {
    found: false,
    transcription: undefined,
    source: undefined,
  };

  if (models.length) {
    for (const model of models) {
      if (state.found) break;
      const loadedModel = await siteApi.getCaptureModel(model.id, { published: true });
      traverseDocument(loadedModel.document, {
        visitField(field) {
          // Capture model data source (text plain)
          if (
            !state.found &&
            field.dataSources &&
            field.dataSources.indexOf('plaintext-source') !== -1 &&
            field.value
          ) {
            // We have a transcription!
            state.found = true;
            if (field.type === 'html') {
              // @todo strip HTML?
            }
            state.transcription = field.value;
          }
        },

        visitEntity(entity, key, parent) {
          // Capture model OCR
          if (!state.found && entity.profile === PARAGRAPHS_PROFILE && parent && key) {
            // We have a paragraphs tree.
            state.found = true;
            state.transcription = paragraphsToPlaintext(parent.properties[key] as any);
          }
        },
      });
    }
  }

  if (!state.found) {
    const linkingProperties = await siteApi.getCanvasLinking(canvasId);

    for (const linkingProperty of linkingProperties.linking) {
      if (state.found) break;
      if (linkingProperty.property === 'seeAlso' && isLinkPlaintext(linkingProperty)) {
        try {
          const transcription = linkingProperty.file
            ? await fetch(api.resolveUrl(linkingProperty.link.id)).then(r => {
                if (!r.ok) throw new Error(`Plaintext fetch failed (${r.status})`);
                return r.text();
              })
            : await fetchAnnotationResource(linkingProperty.link.id);
          if (transcription) {
            state.found = true;
            state.transcription = transcription;
            state.source = linkingProperty.link.id;
          }
        } catch {
          // An unavailable link must not hide another transcription or stored annotation text.
        }
      }
      if (linkingProperty.property === 'seeAlso' && isLinkCaptureModelParagraphs(linkingProperty)) {
        if (linkingProperty.file) {
          const resolvedParagraphs = api.resolveUrl(linkingProperty.link.id);
          const transcription = await fetch(resolvedParagraphs)
            .then(r => r.json())
            .then(
              // unknown why this might be different at this point.
              r => paragraphsToPlaintext(r.paragraph || r.paragraphs)
            );

          if (transcription) {
            state.found = true;
            state.transcription = transcription;
          }
        }
      }
    }
  }

  if (!state.found) {
    const texts = await getAnnotationPlaintext(context.connection, siteId, canvasId, admin);
    if (texts.length) {
      state.found = true;
      state.transcription = texts.map(text => text.text).join('\n');
      state.source = texts[0].source;
    }
  }

  return state;
}

export const getCanvasPlaintext: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  context.response.body = await loadCanvasPlaintext(
    context,
    siteId,
    Number(context.params.id),
    !!context.state.jwt?.scope.includes('site.admin')
  );
};
