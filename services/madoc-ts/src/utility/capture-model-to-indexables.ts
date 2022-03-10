import { traverseDocument } from '../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../frontend/shared/capture-models/types/field-types';

export type SearchIndexable = {
  resource_id: string;
  content_id: string;
  original_content: string;
  indexable: string;
  indexable_date: string | null;
  indexable_int: number | null;
  indexable_float: number | null;
  indexable_json: string | null;
  selector: {
    'box-selector': [[number, number, number, number]];
  } | null;
  type: string;
  subtype: string;
  language_iso639_2: string;
  language_iso639_1: string;
  language_display: string;
  language_pg: string;
};

function extractValueFromModelField(field: BaseField): string {
  // Primitive, but it will work for now.
  return JSON.stringify(field.value);
}

export function captureModelToIndexables(contentId: string, model: CaptureModel['document']): SearchIndexable[] {
  // We need to store the types of the parents.
  const parentEntityTypes: {
    [id: string]: string;
  } = {};

  // Need to store values that have been revised by another field.
  const revisedIds: string[] = [];

  // And the indexables.
  const indexables: SearchIndexable[] = [];

  traverseDocument(model, {
    beforeVisitEntity(entity, key) {
      if (key) {
        parentEntityTypes[entity.id] = key;
      }
    },
    visitField(field, key, parent) {
      // We will filter these out at the end.
      if (field.revises) {
        revisedIds.push(field.revises);
      }

      const type = parentEntityTypes[parent.id] || 'capture-model';

      indexables.push({
        resource_id: contentId,
        content_id: field.id,
        type: type,
        subtype: key,
        original_content: typeof field.value === 'string' ? field.value : JSON.stringify(field.value),
        indexable: typeof field.value === 'string' ? field.value : extractValueFromModelField(field),
        indexable_date: null,
        indexable_float: null,
        indexable_int: null,
        indexable_json: null,
        selector:
          field.selector && field.selector.type === 'box-selector' && field.selector.state
            ? {
                'box-selector': [
                  [
                    field.selector.state.x,
                    field.selector.state.y,
                    field.selector.state.width,
                    field.selector.state.height,
                  ],
                ],
              }
            : null,
        language_iso639_2: 'eng',
        language_iso639_1: 'en',
        language_display: 'english',
        language_pg: 'english',
      });
    },
  });

  // Filter out the revised fields.
  return indexables.filter(indexable => {
    return revisedIds.indexOf(indexable.content_id) === -1;
  });
}
