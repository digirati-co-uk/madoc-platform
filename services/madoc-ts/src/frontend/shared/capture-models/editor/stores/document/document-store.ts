import { action, computed, createContextStore, thunk } from 'easy-peasy';
import { createDocument } from '../../../helpers/create-document';
import { createField } from '../../../helpers/create-field';
import { isEntity } from '../../../helpers/is-entity';
import { resolveSubtree } from '../../../helpers/resolve-subtree';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { DocumentModel } from './document-model';

export const DocumentStore = createContextStore<
  DocumentModel,
  { captureModel: CaptureModel; onDocumentChange?: (model: CaptureModel['document']) => void }
>(initial => {
  return {
    // The actual capture model document we're working on.
    document: initial ? initial.captureModel.document : createDocument(),

    // A path through the document, for example: [ fieldA, fieldB ] would be represent a subtree at:
    // root.properties.fieldA[0].properties.fieldB[0]
    subtreePath: [],

    // The state tracks a single field, in order to offer an optional ergonomic API for editing individual fields.
    selectedFieldKey: null,

    // This will use the `subtreePath` value to compute the actual subtree when it updates, allowing it to be computed
    // once and used in multiple places.
    subtree: computed([state => state.subtreePath, state => state.document], (subtreePath, document) => {
      return resolveSubtree(subtreePath, document);
    }),

    // These are the property keys for a single subtree. This can be used an index for the properties.
    subtreeFieldKeys: computed([state => state.subtree], subtree => Object.keys(subtree.properties)),

    // This flattens a subtree into an enumerable list of keys and values.
    subtreeFields: computed(
      [state => state.subtreeFieldKeys, state => state.subtree],
      (keys: string[], subtree: CaptureModel['document']) => {
        return keys.map(key => {
          const item = subtree.properties[key];

          return { term: key, value: item[0] as BaseField | CaptureModel['document'] };
        });
      }
    ),

    // A way to replace the whole subtree path in one go.
    setSubtree: action((state, terms) => {
      state.selectedFieldKey = null;
      state.subtreePath = terms;
    }),

    // A helper to push a new subtree path, useful for navigation.
    pushSubtree: action((state, term) => {
      state.selectedFieldKey = null;
      state.subtreePath.push(term);
    }),

    // A helper to pop the last subtree path, useful for navigation.
    popSubtree: action((state, payload) => {
      state.selectedFieldKey = null;
      state.subtreePath = state.subtreePath.slice(0, payload && payload.count ? -1 * payload.count : -1);
    }),

    // A way to set the selected field.
    selectField: action((state, fieldKey) => {
      if (resolveSubtree(state.subtreePath, state.document).properties[fieldKey]) {
        state.selectedFieldKey = fieldKey;
      }
    }),

    // A simple way to deselect all fields.
    deselectField: action(state => {
      state.selectedFieldKey = null;
    }),

    // Adds a new field to the current subtree, and then selects it.
    addField: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      resolveSubtree(subtreePath, state.document).properties[payload.term] = [createField(payload.field)];
      if (payload.select && subtreePath === state.subtreePath) {
        if ((payload.field.type as string) === 'entity') {
          state.selectedFieldKey = null;
          state.subtreePath.push(payload.term);
        } else {
          state.selectedFieldKey = payload.term;
        }
      }
    }),

    // Removes a field.
    removeField: action((state, payload) => {
      delete resolveSubtree(state.subtreePath, state.document).properties[payload];
    }),

    reorderField: action(() => {
      // @todo
    }),

    // This sets the non-state values, such as metadata on ALL instances of the
    // capture model field.
    setField: thunk((actions, payload) => {
      // get the keys.
      const keys = Object.keys(payload.field);
      // Add the following by dispatching the actions
      const skipKeys = ['selector', 'authors', 'revision', 'value'];
      // Loop the keys and apply custom values.
      const values = [];
      for (const key of keys) {
        if (skipKeys.indexOf(key) !== -1) continue;
        values.push({
          key,
          value: (payload.field as any)[key],
        });
      }
      actions.setCustomProperties({ term: payload.term, values, subtreePath: payload.subtreePath });

      actions.setFieldValue({ term: payload.term, value: payload.field.value, subtreePath: payload.subtreePath });
      actions.setFieldSelector({
        term: payload.term,
        selector: payload.field.selector,
        subtreePath: payload.subtreePath,
      });

      // Creat new action for setting custom property on field
      // This will allow all of the field setters to be generic and look for all fields that need to be updated, at the
      // same level but in different trees.
    }),

    setCustomProperties: action((state, payload) => {
      // Add the following by dispatching the actions
      const skipKeys = ['selector', 'authors', 'revision', 'value'];
      // Get property changing.
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const subtree = resolveSubtree(subtreePath, state.document);
      // Loop the keys and apply custom values.
      for (const { value, key } of payload.values) {
        if (skipKeys.indexOf(key) !== -1) continue;
        const property = subtree.properties[prop];
        if (!property) continue;
        for (const term of property) {
          (term as any)[key] = value;
        }
      }
    }),

    // Sets a custom property on the selected field.
    setCustomProperty: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        (term as any)[payload.key] = payload.value;
      }
    }),

    // Sets label on the selected field.
    setLabel: action((state, label) => {
      resolveSubtree(state.subtreePath, state.document).label = label;
    }),

    // Sets description on the selected field.
    setDescription: action((state, description) => {
      resolveSubtree(state.subtreePath, state.document).description = description;
    }),

    setSelector: action((state, payload) => {
      resolveSubtree(state.subtreePath, state.document).selector = payload.selector;
    }),

    setAllowMultiple: action((state, payload) => {
      resolveSubtree(state.subtreePath, state.document).allowMultiple = payload;
    }),

    setPluralLabel: action((state, payload) => {
      if (!payload) {
        delete resolveSubtree(state.subtreePath, state.document).pluralLabel;
      } else {
        resolveSubtree(state.subtreePath, state.document).pluralLabel = payload;
      }
    }),

    setLabelledBy: action((state, payload) => {
      if (!payload) {
        delete resolveSubtree(state.subtreePath, state.document).labelledBy;
      } else {
        resolveSubtree(state.subtreePath, state.document).labelledBy = payload;
      }
    }),

    setSelectorState: action((state, payload) => {
      const selector = resolveSubtree(state.subtreePath, state.document).selector;
      if (selector) {
        selector.state = payload as any;
      }
    }),

    // setContext: action((state, payload) => {
    //   resolveSubtree(state.subtreePath, state.document)['@context'] = payload;
    // }),

    // Same as the helpers above but pre-filled with the currently selected field.
    // @todo all of these need support for nested resources. They should update cousin items too.
    //   - label: resource A
    //     collectionA:
    //       - label: resource A1
    //         collectionB:
    //           - label: resource B1 <-- changing this label should change B2 and B3 too, all the way up.
    //       - label: resource A1
    //         collectionB:
    //           - label: resource B2
    //       - label: resource A1
    //         collectionB:
    //           - label: resource B3
    setFieldLabel: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        term.label = payload.label;
      }
    }),

    setFieldType: action((state, payload) => {
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        term.type = payload.type;
        if (payload.defaults) {
          for (const defaultKey of Object.keys(payload.defaults)) {
            if (typeof (term as any)[defaultKey] === 'undefined') {
              (term as any)[defaultKey] = payload.defaults[defaultKey];
            }
          }
        }
      }
    }),

    setFieldDescription: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        term.description = payload.description;
      }
    }),
    setFieldSelector: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        term.selector = payload.selector;
      }
    }),
    setFieldSelectorState: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        if (term.selector) {
          term.selector.state = payload as any;
        }
      }
    }),
    setFieldValue: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const prop = (payload.term ? payload.term : state.selectedFieldKey) as string;
      for (const term of resolveSubtree(subtreePath, state.document).properties[prop]) {
        if (!isEntity(term)) {
          term.value = payload.value;
        }
      }
    }),
    setFieldTerm: action((state, payload) => {
      const subtreePath = payload.subtreePath ? payload.subtreePath : state.subtreePath;
      const subtree = resolveSubtree(subtreePath, state.document);
      const field = subtree.properties[payload.oldTerm];
      delete subtree.properties[payload.oldTerm];
      subtree.properties[payload.newTerm] = field;
    }),
  };
});
