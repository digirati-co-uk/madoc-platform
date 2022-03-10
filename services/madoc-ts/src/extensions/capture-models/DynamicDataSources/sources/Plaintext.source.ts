import { FieldSource } from '../../../../frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { DynamicData, DynamicDataLoader } from '../types';

const plaintextSourceDefinition: FieldSource = {
  id: 'plaintext-source',
  name: 'Plaintext',
  description: 'Source plain-text from seeAlso fields in IIIF resources.',
  defaultProps: {},
  fieldTypes: ['text-field', 'html-field', 'tagged-text-field'],
};

const plainTextSourceLoader: DynamicDataLoader = async (field, key, canvas, api) => {
  try {
    // 1. Load canvas seeAlso
    const linking = await api.getCanvasLinking(canvas.id);

    const matchingPlaintext = linking.linking.find(singleLink => {
      // @todo this could be extended to be configured from the field.
      return singleLink.property === 'seeAlso' && singleLink.link.format === 'text/plain';
    });

    if (!matchingPlaintext) {
      return field;
    }

    // 2. Look for suitable plain text and load it
    const plaintextUrl = matchingPlaintext.file ? api.resolveUrl(matchingPlaintext.link.id) : matchingPlaintext.link.id;
    const plaintext = await fetch(plaintextUrl).then(t => t.text());

    if (!plaintext) {
      return field;
    }

    // 3. Add plain text to value of field.
    if (field.type === 'html-field') {
      // @todo maybe make this configurable.
      field.value = plaintext.split('\n').join('<br />');
    } else {
      // 3. Add plain text to value of field.
      field.value = plaintext;
    }

    return field;
  } catch (err) {
    console.log(err);
    return field;
  }
};

export const plainTextSource: DynamicData = {
  loader: plainTextSourceLoader,
  definition: plaintextSourceDefinition,
};
