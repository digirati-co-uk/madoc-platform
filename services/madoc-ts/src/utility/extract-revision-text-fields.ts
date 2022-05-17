import { InternationalString } from '@iiif/presentation-3';
import { traverseDocument } from '../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';

export const stringBasedFields = ['text-field', 'dropdown-field', 'tagged-text-field', 'html-field', 'color-field'];

export function extractRevisionTextFields(document: CaptureModel['document'], revisionId?: string) {
  const keysFound: string[] = [];
  const stringValues: Record<string, string> = {};
  const langValues: Record<string, InternationalString> = {};
  const keyLabels: Record<string, string> = {};
  const originalKeys: Record<string, string> = {};
  let modified = false;

  traverseDocument(document, {
    visitField(field, key_) {
      if (typeof revisionId === 'undefined' || field.revision === revisionId) {
        // Only apply changes made in this revision.
        const label = field.label || key_;
        const key = label.toLowerCase();
        keyLabels[key] = label;
        originalKeys[key] = key_;
        if (key && field.type === 'international-field') {
          keysFound.push(key);
          langValues[key] = field.value;
          modified = true;
          return;
        }

        if (key && stringBasedFields.indexOf(field.type) !== -1) {
          keysFound.push(key);
          stringValues[key] = field.value;
          modified = true;
          return;
        }
      }
    },
  });

  return {
    keysFound,
    stringValues,
    langValues,
    keyLabels,
    originalKeys,
    modified,
  };
}
