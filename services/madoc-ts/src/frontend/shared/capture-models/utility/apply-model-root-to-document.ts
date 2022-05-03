import { isEntity } from '../helpers/is-entity';
import { splitDocumentByModelRoot } from '../helpers/split-document-by-model-root';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';

export function applyModelRootToDocument(
  document: CaptureModel['document'],
  modelRoot?: string[] | null,
  {
    preventAdditionsAdjacentToRoot = true,
    editableAboveRoot = false,
  }: { preventAdditionsAdjacentToRoot?: boolean; editableAboveRoot?: boolean } = {}
) {
  const [immutableDocuments] = splitDocumentByModelRoot(document, modelRoot || []);
  const documentsToPreventFurtherAdditions: CaptureModel['document'][] = [];
  // Iterate through `immutableDocuments` to find properties that are
  // marked as allowMultiple=true and set them to false. (also the doc itself)
  // also do NOT add revision ID to this.
  // @todo do this at the end when we do the full traverse + filter.
  immutableDocuments.forEach(docList => {
    docList.documents.forEach(doc => {
      doc.immutable = true;
      if (doc.allowMultiple) {
        doc.allowMultiple = false;
      }

      Object.keys(doc.properties).forEach(term => {
        const prop = doc.properties[term];
        prop.forEach((field: BaseField | CaptureModel['document']) => {
          // These are all of the fields above the root.
          if (!isEntity(field) && !editableAboveRoot) {
            field.allowMultiple = false;
          }
          if (isEntity(field)) {
            documentsToPreventFurtherAdditions.push(field);
          }
        });
      });
    });
  });

  if (preventAdditionsAdjacentToRoot) {
    // Prevent the documents at the root from being added to.
    for (const doc of documentsToPreventFurtherAdditions) {
      doc.allowMultiple = false;
    }
  }
}
