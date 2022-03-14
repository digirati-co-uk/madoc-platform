import { traverseDocument } from '../../../helpers/traverse-document';
import { CaptureModel } from '../../../types/capture-model';
import { BaseSelector } from '../../../types/selector-types';
import { SelectorModel } from './selector-model';

export function updateSelectorStore(document?: CaptureModel['document'], prefixPath: [string, string][] = []) {
  const selectorIds: string[] = [];
  const selectors: BaseSelector[] = [];
  const selectorPaths: { [id: string]: Array<[string, string]> } = {};

  if (document) {
    // We need to record the path to the current item using the propKey and
    // the parents ID. `document.properties.people[].fieldA[]` would be `[ [people, person-id], [fieldA, field-id] ]`
    const recordPath = (field: any, propKey?: string, parent?: any) => {
      if (!field.temp) {
        field.temp = {};
      }
      if (!field.temp.path) {
        if (parent && parent.temp && parent.temp.path) {
          field.temp.path = [...parent.temp.path];
        } else {
          field.temp.path = [...prefixPath];
        }
      }

      if (parent && propKey) {
        field.temp.path.push([propKey, field.id]);
      }
    };
    traverseDocument<{ path: [string, string][] }>(document, {
      visitSelector(selector, parent) {
        if (parent && parent.temp) {
          // We have the path to the selector here: parent.temp.path
          // Now we just need to store this in the state.
          selectorPaths[selector.id] = parent.temp.path || [];
        }
        if (selectorIds.indexOf(selector.id) === -1) {
          selectors.push(selector);
          selectorIds.push(selector.id);
        }
      },
      visitField: recordPath,
      beforeVisitEntity: recordPath,
    });
  }

  return {
    availableSelectors: selectors,
    selectorPaths,
  };
}

export function createSelectorStore(document?: CaptureModel['document']): SelectorModel {
  const { availableSelectors, selectorPaths } = updateSelectorStore(document);

  return {
    availableSelectors,
    currentSelectorId: null,
    selectorPreviewData: {},
    currentSelectorState: null,
    topLevelSelector: null,
    visibleSelectorIds: [],
    selectorPaths,
  };
}
