import { Revisions } from '../../editor/stores/revisions';
import { isTwoLevelInlineEntityModel } from '../utility/get-max-entity-depth';

export function useTwoLevelInlineMode() {
  return Revisions.useStoreState(state => {
    if (!state.currentRevision) {
      return false;
    }

    return isTwoLevelInlineEntityModel(state.currentRevision.document);
  });
}
