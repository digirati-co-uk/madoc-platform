import { Store } from 'easy-peasy';
import { RevisionsModel } from '../../editor/stores/revisions';
import { CaptureModel } from '../../types/capture-model';
import { RevisionRequest } from '../../types/revision-request';

export type EnsureWorkingRevisionResult = {
  revisionId: string | null;
  needsSelection: boolean;
  reason?: string;
};

export function isRevisionOwnedByUser(revision: RevisionRequest, userId?: string | number) {
  if (!userId) {
    return true;
  }

  const urn = `urn:madoc:user:${userId}`;
  return (revision.revision.authors || []).indexOf(urn) !== -1;
}

type RevisionStoreState = {
  currentRevisionId?: string | null;
  revisions: { [id: string]: RevisionRequest };
  currentStructure?: CaptureModel['structure'];
  structure?: CaptureModel['structure'];
  structureMap?: { [id: string]: { id: string; structure: CaptureModel['structure']; path: string[] } };
};

function getSingleDeterministicModelId(state: RevisionStoreState): string | null {
  const currentStructure = state.currentStructure;
  const rootStructure = state.structure;

  if (currentStructure && currentStructure.type === 'model') {
    return currentStructure.id;
  }

  if (currentStructure && currentStructure.type === 'choice') {
    const modelItems = currentStructure.items.filter(item => item.type === 'model');
    if (modelItems.length === 1) {
      return modelItems[0].id;
    }
    return null;
  }

  if (rootStructure && rootStructure.type === 'model') {
    return rootStructure.id;
  }

  if (rootStructure && rootStructure.type === 'choice') {
    const modelItems = rootStructure.items.filter(item => item.type === 'model');
    if (modelItems.length === 1) {
      return modelItems[0].id;
    }
  }

  return null;
}

export function ensureWorkingRevision(
  store: Store<RevisionsModel>,
  options: { userId?: string | number } = {}
): EnsureWorkingRevisionResult {
  const state = store.getState() as unknown as RevisionStoreState;

  if (state.currentRevisionId) {
    return {
      revisionId: state.currentRevisionId,
      needsSelection: false,
    };
  }

  const revisions = Object.values(state.revisions || {});

  const draftRevisions = revisions.filter(
    revision =>
      revision.revision.status === 'draft' &&
      revision.source !== 'canonical' &&
      isRevisionOwnedByUser(revision, options.userId)
  );

  if (draftRevisions.length === 1) {
    store.getActions().selectRevision({ revisionId: draftRevisions[0].revision.id });
    return {
      revisionId: draftRevisions[0].revision.id,
      needsSelection: false,
    };
  }

  if (draftRevisions.length > 1) {
    return {
      revisionId: null,
      needsSelection: true,
      reason: 'Multiple draft revisions exist for the current user.',
    };
  }

  const deterministicModelId = getSingleDeterministicModelId(state);

  if (!deterministicModelId) {
    return {
      revisionId: null,
      needsSelection: true,
      reason: 'Could not determine a single model structure to edit.',
    };
  }

  const targetStructure = state.structureMap ? state.structureMap[deterministicModelId]?.structure : undefined;
  const cloneMode =
    targetStructure && targetStructure.type === 'model' && targetStructure.modelRoot && targetStructure.modelRoot.length
      ? 'FORK_INSTANCE'
      : 'EDIT_ALL_VALUES';

  try {
    store.getActions().createRevision({
      revisionId: deterministicModelId,
      cloneMode,
    });
  } catch (error: any) {
    return {
      revisionId: null,
      needsSelection: true,
      reason: error?.message || 'Unable to create a revision for the selected structure.',
    };
  }

  const nextState = store.getState();

  if (nextState.currentRevisionId) {
    return {
      revisionId: nextState.currentRevisionId,
      needsSelection: false,
    };
  }

  return {
    revisionId: null,
    needsSelection: true,
    reason: 'Revision creation did not produce a selected revision.',
  };
}
