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

function isSharedRevisionCandidate(revision: RevisionRequest): boolean {
  if (revision.source === 'canonical') {
    return false;
  }

  if (revision.revision.approved) {
    return true;
  }

  return revision.revision.status === 'accepted' || revision.revision.status === 'submitted';
}

function getRevisionStatusScore(revision: RevisionRequest): number {
  if (revision.revision.approved || revision.revision.status === 'accepted') {
    return 2;
  }

  if (revision.revision.status === 'submitted') {
    return 1;
  }

  return 0;
}

function getRevisionDepth(
  revisionId: string,
  byId: Map<string, RevisionRequest>,
  cache: Map<string, number>,
  seen = new Set<string>()
): number {
  if (cache.has(revisionId)) {
    return cache.get(revisionId) as number;
  }

  if (seen.has(revisionId)) {
    return 0;
  }

  const revision = byId.get(revisionId);
  if (!revision?.revision.revises || !byId.has(revision.revision.revises)) {
    cache.set(revisionId, 0);
    return 0;
  }

  const nextSeen = new Set(seen);
  nextSeen.add(revisionId);
  const depth = 1 + getRevisionDepth(revision.revision.revises, byId, cache, nextSeen);
  cache.set(revisionId, depth);
  return depth;
}

function getPreferredSharedRevision(
  revisions: RevisionRequest[],
  structureId?: string | null
): RevisionRequest | undefined {
  const sharedCandidates = revisions.filter(isSharedRevisionCandidate);
  if (!sharedCandidates.length) {
    return undefined;
  }

  const structureScopedCandidates =
    structureId === undefined || structureId === null
      ? sharedCandidates
      : sharedCandidates.filter(
          revision => revision.revision.structureId === structureId || !revision.revision.structureId
        );

  const candidates = structureScopedCandidates.length ? structureScopedCandidates : sharedCandidates;

  if (!candidates.length) {
    return undefined;
  }

  const byId = new Map(candidates.map(revision => [revision.revision.id, revision]));
  const revisedByCandidate = new Set<string>();

  for (const revision of candidates) {
    const revises = revision.revision.revises;
    if (revises && byId.has(revises)) {
      revisedByCandidate.add(revises);
    }
  }

  const leafCandidates = candidates.filter(revision => !revisedByCandidate.has(revision.revision.id));
  const rankedCandidates = leafCandidates.length ? leafCandidates : candidates;
  const depthCache = new Map<string, number>();

  return [...rankedCandidates]
    .sort((left, right) => {
      const leftDepth = getRevisionDepth(left.revision.id, byId, depthCache);
      const rightDepth = getRevisionDepth(right.revision.id, byId, depthCache);

      if (leftDepth !== rightDepth) {
        return rightDepth - leftDepth;
      }

      const leftStatusScore = getRevisionStatusScore(left);
      const rightStatusScore = getRevisionStatusScore(right);

      if (leftStatusScore !== rightStatusScore) {
        return rightStatusScore - leftStatusScore;
      }

      return right.revision.id.localeCompare(left.revision.id);
    })
    [0];
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
  options: { userId?: string | number; preferSharedRevisionAsBase?: boolean } = {}
): EnsureWorkingRevisionResult {
  const state = store.getState() as unknown as RevisionStoreState;

  if (state.currentRevisionId) {
    return {
      revisionId: state.currentRevisionId,
      needsSelection: false,
    };
  }

  const revisions = Object.values(state.revisions || {});
  const authorUrn = options.userId ? `urn:madoc:user:${options.userId}` : undefined;

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

  if (options.preferSharedRevisionAsBase) {
    const preferredRevision = getPreferredSharedRevision(revisions, deterministicModelId);
    if (preferredRevision) {
      try {
        store.getActions().createRevision({
          revisionId: preferredRevision.revision.id,
          cloneMode: 'EDIT_ALL_VALUES',
          authorUrn,
        });
      } catch (error: any) {
        return {
          revisionId: null,
          needsSelection: true,
          reason: error?.message || 'Unable to create a revision from the latest shared contribution.',
        };
      }

      const nextState = store.getState();
      if (nextState.currentRevisionId) {
        return {
          revisionId: nextState.currentRevisionId,
          needsSelection: false,
        };
      }
    }
  }

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
      authorUrn,
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
