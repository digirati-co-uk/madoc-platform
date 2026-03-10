import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { Revisions } from '../../shared/capture-models/editor/stores/revisions';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { ensureWorkingRevision } from '../../shared/capture-models/new/utility/ensure-working-revision';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { useLoadedCaptureModel } from '../../shared/hooks/use-loaded-capture-model';
import { useManifestStructure } from '../../shared/hooks/use-manifest-structure';
import { useViewerSaving } from '../../shared/hooks/use-viewer-saving';
import { useCanvasModel } from './use-canvas-model';
import { useCanvasUserTasks } from './use-canvas-user-tasks';
import { useInvalidateAfterSubmission } from './use-invalidate-after-submission';
import { usePrepareContribution } from './use-prepare-contribution';
import { usePreparedCanvasModel } from './use-prepared-canvas-model';
import { useRelativeLinks } from './use-relative-links';
import { useRouteContext } from './use-route-context';

export type NextCanvasData = {
  hasNext: boolean;
  currentIndex: number;
  total: number;
  next?: {
    id: number;
    label: any;
    thumbnail?: string;
    href: string;
  };
};

export type ContributionLifecycle = {
  phase:
    | 'loading'
    | 'preparing'
    | 'ready'
    | 'saving-draft'
    | 'submitting'
    | 'submitted'
    | 'blocked'
    | 'error';
  hasCaptureModel: boolean;
  hasExpired: boolean;
  canContribute: boolean;
  canUserSubmit: boolean;
  preventFurtherSubmission: boolean;
  markedAsUnusable: boolean;
  needsRevisionSelection: boolean;
  revisionId?: string;
  nextCanvas: NextCanvasData;
  refresh: () => Promise<void>;
  prepare: () => Promise<void>;
  ensureRevision: () => Promise<string | null>;
  saveDraft: () => Promise<void>;
  saveForLater: () => Promise<void>;
  submit: () => Promise<void>;
  lastError?: Error;
  lastErrorStage?: 'prepare' | 'save';
};

export function getNextCanvasData(options: {
  structure?: { ids: number[]; items: ItemStructureListItem[] };
  canvasId?: number;
  createLink: (opts?: {
    projectId?: string | number;
    collectionId?: string | number;
    manifestId?: string | number;
    canvasId?: string | number;
    taskId?: string;
    parentTaskId?: string;
    query?: any;
    subRoute?: string;
    admin?: boolean;
    hash?: string;
  }) => string;
}): NextCanvasData {
  const { structure, canvasId, createLink } = options;

  const total = structure?.items?.length || 0;
  const currentIndex = structure && canvasId ? structure.ids.indexOf(canvasId) : -1;

  if (!structure || currentIndex === -1) {
    return {
      hasNext: false,
      currentIndex,
      total,
    };
  }

  const nextItem = currentIndex < structure.items.length - 1 ? structure.items[currentIndex + 1] : undefined;

  if (!nextItem) {
    return {
      hasNext: false,
      currentIndex,
      total,
    };
  }

  return {
    hasNext: true,
    currentIndex,
    total,
    next: {
      id: nextItem.id,
      label: nextItem.label,
      thumbnail: nextItem.thumbnail,
      href: createLink({ canvasId: nextItem.id, subRoute: 'model' }),
    },
  };
}

export function resolveContributionPhase(options: {
  hasBlockingError: boolean;
  isLoading: boolean;
  isPreparing: boolean;
  isBlocked: boolean;
  pendingState: 'idle' | 'preparing' | 'saving-draft' | 'submitting' | 'submitted';
}): ContributionLifecycle['phase'] {
  const { hasBlockingError, isLoading, isPreparing, isBlocked, pendingState } = options;

  if (hasBlockingError) {
    return 'error';
  }

  if (pendingState === 'saving-draft') {
    return 'saving-draft';
  }

  if (pendingState === 'submitting') {
    return 'submitting';
  }

  if (pendingState === 'submitted') {
    return 'submitted';
  }

  if (isPreparing || pendingState === 'preparing') {
    return 'preparing';
  }

  if (isLoading) {
    return 'loading';
  }

  if (isBlocked) {
    return 'blocked';
  }

  return 'ready';
}

export async function persistContributionRevision(options: {
  status: 'draft' | 'submitted';
  blocked: boolean;
  ensureRevision: () => Promise<string | null>;
  getCurrentRevision: () => RevisionRequest | null;
  saveRevision: (revision: RevisionRequest, status: 'draft' | 'submitted') => Promise<any>;
  refresh: () => Promise<void>;
}): Promise<void> {
  if (options.blocked) {
    throw new Error('Contribution is blocked and cannot be saved.');
  }

  await options.ensureRevision();

  const currentRevision = options.getCurrentRevision();

  if (!currentRevision) {
    throw new Error('No active revision could be selected for saving.');
  }

  await options.saveRevision(currentRevision, options.status);
  await options.refresh();
}

export function useCaptureModelContributionLifecycle(): ContributionLifecycle {
  const routeContext = useRouteContext();
  const { manifestId, canvasId } = routeContext;
  const currentUser = useCurrentUser(true);
  const createLink = useRelativeLinks();

  const store = Revisions.useStore();
  const currentRevisionId = Revisions.useStoreState(state => state.currentRevisionId || undefined);

  const preparedCanvasModel = usePreparedCanvasModel();
  const { data: projectModel, isLoading: isCanvasModelLoading, refetch: refetchCanvasModel } = useCanvasModel();
  const [{ captureModel }, modelStatus, modelRefetch] = useLoadedCaptureModel(projectModel?.model?.id, undefined, canvasId);

  const {
    updateClaim,
    preventFurtherSubmission,
    canContribute,
    markedAsUnusable,
    canUserSubmit,
    isLoading: isTaskLoading,
    refetch: refetchCanvasTasks,
  } = useCanvasUserTasks();

  const invalidateAfterSubmission = useInvalidateAfterSubmission();
  const [prepareContribution, prepareContributionState] = usePrepareContribution();
  const manifestStructure = useManifestStructure(manifestId);

  const [pendingState, setPendingState] = useState<'idle' | 'preparing' | 'saving-draft' | 'submitting' | 'submitted'>(
    'idle'
  );
  const [needsRevisionSelection, setNeedsRevisionSelection] = useState(false);
  const [lastError, setLastError] = useState<Error | undefined>(undefined);
  const [lastErrorStage, setLastErrorStage] = useState<'prepare' | 'save' | undefined>(undefined);
  const attemptedAutoRevision = useRef<string | undefined>(undefined);

  const saveRevision = useViewerSaving(async revisionRequest => {
    await updateClaim({
      revisionRequest,
      context: routeContext,
    });

    await modelRefetch();
  });

  const hasCaptureModel = !!captureModel;
  const hasExpired = preparedCanvasModel.hasExpired;
  const isBlocked = hasExpired || preventFurtherSubmission || !canContribute || !canUserSubmit;

  const refresh = useCallback(async () => {
    await Promise.all([
      invalidateAfterSubmission(),
      refetchCanvasModel(),
      refetchCanvasTasks(),
      modelRefetch(),
      manifestStructure.refetch(),
    ]);
  }, [invalidateAfterSubmission, manifestStructure, modelRefetch, refetchCanvasModel, refetchCanvasTasks]);

  const ensureRevision = useCallback(async () => {
    const result = ensureWorkingRevision(store, {
      userId: currentUser.user?.id,
    });

    setNeedsRevisionSelection(result.needsSelection);

    if (!result.revisionId && result.reason) {
      setLastError(undefined);
    }

    return result.revisionId;
  }, [currentUser.user?.id, store]);

  useEffect(() => {
    if (!captureModel?.id) {
      attemptedAutoRevision.current = undefined;
      setNeedsRevisionSelection(false);
      return;
    }

    if (currentRevisionId) {
      setNeedsRevisionSelection(false);
      return;
    }

    if (attemptedAutoRevision.current === captureModel.id) {
      return;
    }

    attemptedAutoRevision.current = captureModel.id;
    void ensureRevision();
  }, [captureModel?.id, currentRevisionId, ensureRevision]);

  const prepare = useCallback(async () => {
    setPendingState('preparing');
    setLastError(undefined);
    setLastErrorStage(undefined);

    try {
      await prepareContribution();
      await refresh();
      setPendingState('idle');
    } catch (error: any) {
      setLastError(error instanceof Error ? error : new Error(String(error)));
      setLastErrorStage('prepare');
      setPendingState('idle');
      throw error;
    }
  }, [prepareContribution, refresh]);

  const saveWithStatus = useCallback(
    async (status: 'draft' | 'submitted') => {
      setLastError(undefined);
      setLastErrorStage(undefined);
      setPendingState(status === 'draft' ? 'saving-draft' : 'submitting');

      try {
        await persistContributionRevision({
          status,
          blocked: isBlocked,
          ensureRevision,
          getCurrentRevision: () => store.getState().currentRevision,
          saveRevision,
          refresh,
        });

        setPendingState(status === 'submitted' ? 'submitted' : 'idle');
      } catch (error: any) {
        setLastError(error instanceof Error ? error : new Error(String(error)));
        setLastErrorStage('save');
        setPendingState('idle');
        throw error;
      }
    },
    [ensureRevision, isBlocked, refresh, saveRevision, store]
  );

  const saveDraft = useCallback(async () => {
    await saveWithStatus('draft');
  }, [saveWithStatus]);

  const submit = useCallback(async () => {
    await saveWithStatus('submitted');
  }, [saveWithStatus]);

  const nextCanvas = useMemo(
    () =>
      getNextCanvasData({
        structure: manifestStructure.data,
        canvasId,
        createLink,
      }),
    [canvasId, createLink, manifestStructure.data]
  );

  const phase = resolveContributionPhase({
    hasBlockingError: !!lastError && lastErrorStage === 'prepare',
    isLoading: isCanvasModelLoading || isTaskLoading || modelStatus === 'loading',
    isPreparing: preparedCanvasModel.isPreparing || prepareContributionState.isLoading,
    isBlocked,
    pendingState,
  });

  return {
    phase,
    hasCaptureModel,
    hasExpired,
    canContribute: !!canContribute,
    canUserSubmit: !!canUserSubmit,
    preventFurtherSubmission: !!preventFurtherSubmission,
    markedAsUnusable: !!markedAsUnusable,
    needsRevisionSelection: !currentRevisionId && needsRevisionSelection,
    revisionId: currentRevisionId,
    nextCanvas,
    refresh,
    prepare,
    ensureRevision,
    saveDraft,
    saveForLater: saveDraft,
    submit,
    lastError,
    lastErrorStage,
  };
}
