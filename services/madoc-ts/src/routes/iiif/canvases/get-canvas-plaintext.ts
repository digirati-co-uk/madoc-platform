import { traverseDocument } from '@capture-models/helpers';
import {
  paragraphsToPlaintext,
  PARAGRAPHS_PROFILE,
} from '../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { isLinkCaptureModelParagraphs, isLinkPlaintext } from '../../../utility/linking-property-types';
import { optionalUserWithScope, userWithScope } from '../../../utility/user-with-scope';

export const getCanvasPlaintext: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const siteApi = api.asUser({ siteId });

  // Get all capture models.
  const models = await siteApi.getAllCaptureModels({
    target_id: `urn:madoc:canvas:${context.params.id}`,
    target_type: 'Canvas',
    all_derivatives: true,
  });

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
    const linkingProperties = await siteApi.getCanvasLinking(Number(context.params.id));

    for (const linkingProperty of linkingProperties.linking) {
      if (linkingProperty.property === 'seeAlso' && isLinkPlaintext(linkingProperty)) {
        if (linkingProperty.file) {
          const resolvedParagraphs = api.resolveUrl(linkingProperty.link.id);
          const transcription = await fetch(resolvedParagraphs).then(r => r.text());

          if (transcription) {
            state.found = true;
            state.transcription = transcription;
          }
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

  context.response.body = state;
};
