import { Revisions } from '../editor/stores/revisions/index';
import { getRevisionFieldFromPath } from '../helpers/get-revision-field-from-path';

export function useSelectorField() {
  return Revisions.useStoreState(state => {
    const selector = state.selector.currentSelectorId;
    const path = selector ? state.selector.selectorPaths[selector] : undefined;
    if (!path) {
      return undefined;
    }
    const lastPathSegment = path[path.length - 1];
    const property = lastPathSegment[0];
    return {
      path,
      property,
      field: getRevisionFieldFromPath(state, path),
    };
  }, []);
}
