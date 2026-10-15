import { PARAGRAPHS_PROFILE } from '../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { isEntity } from '../../frontend/shared/capture-models/helpers/is-entity';
import { traverseStructure } from '../../frontend/shared/capture-models/helpers/traverse-structure';
import { CaptureModel, ModelFields } from '../../frontend/shared/capture-models/types/capture-model';
import { documentToDefaultStructure } from '../../frontend/shared/capture-models/utility/document-to-default-structure';

export function migrateOcrStructure(
  structure: CaptureModel['structure'],
  document: CaptureModel['document']
): CaptureModel['structure'] {
  traverseStructure(structure, item => {
    if (item.type !== 'model') return;

    item.fields = item.fields.map((field): ModelFields[number] => {
      if (typeof field === 'string') return field;
      const [key, fields] = field;
      const value = document.properties[key]?.[0];

      // Older OCR imports overwrote the structure shared with the project template.
      if (value?.type === 'madoc-paragraphs') return key;

      // Some OCR converters return lines directly, without a paragraph's lines level.
      if (
        isEntity(value) &&
        value.profile === PARAGRAPHS_PROFILE &&
        JSON.stringify(fields) === JSON.stringify([['lines', ['text']]]) &&
        !value.properties.lines &&
        value.properties.text
      ) {
        return [key, documentToDefaultStructure(value)];
      }
      return field;
    });
  });

  return structure;
}
