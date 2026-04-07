import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CaptureModelEditorApi } from '@/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { apiHooks } from '@/frontend/shared/hooks/use-api-query';
import {
  TABULAR_CELL_FLAGS_PROPERTY,
  areTabularCellFlagsEqual,
  getTabularCellFlagKey,
  isTabularCellFlagged,
  isTabularCellNote,
  parseTabularCellFlags,
  serializeTabularCellFlags,
  shiftTabularCellFlagsAfterRowRemoval,
  type TabularCellFlagMap,
} from '@/frontend/shared/utility/tabular-cell-flags';
import {
  parsePersonalNotePayload,
  serializePersonalNotePayload,
} from '@/frontend/shared/utility/personal-note-payload';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { getTabularCellElementId } from './tabular-project-custom-editor-utils';
import type { TabularCellReviewItem } from './tabular-project-custom-editor-sidebar';
import type { TabularEditorHeaderModel } from './tabular-project-custom-editor-table-model';

type UseTabularCellFlagsOptions = {
  table: CaptureModelEditorApi;
  projectId?: number | string;
  canvasId?: number;
  visibleColumnKeys: string[];
  headerColumns: TabularEditorHeaderModel[];
  tableActiveCell: TabularCellRef | null;
  setTableActiveCell: (next: TabularCellRef | null) => void;
  useLegacyTopLevelLayout: boolean;
  removeRowFromFooter: () => number | null;
};

export function useTabularCellFlags({
  table,
  projectId,
  canvasId,
  visibleColumnKeys,
  headerColumns,
  tableActiveCell,
  setTableActiveCell,
  useLegacyTopLevelLayout,
  removeRowFromFooter,
}: UseTabularCellFlagsOptions) {
  const api = useApi();
  const [pendingCellFlags, setPendingCellFlags] = useState<TabularCellFlagMap | null>(null);
  const fallbackQueuedFlagsRef = useRef<TabularCellFlagMap | null>(null);
  const fallbackSyncInFlightRef = useRef(false);
  const fallbackFlushTimerRef = useRef<number | null>(null);

  const cellFlagsField = table.topLevelFields[TABULAR_CELL_FLAGS_PROPERTY]?.[0];
  const { data: personalNoteData, refetch: refetchPersonalNote } = apiHooks.getPersonalNote(() =>
    projectId && canvasId ? [projectId, canvasId] : undefined
  );
  const parsedPersonalNote = useMemo(() => parsePersonalNotePayload(personalNoteData?.note), [personalNoteData?.note]);

  const sourceCellFlags = useMemo(() => {
    if (cellFlagsField) {
      return parseTabularCellFlags(cellFlagsField.value);
    }

    return parsedPersonalNote.tabularCellFlags;
  }, [cellFlagsField, parsedPersonalNote.tabularCellFlags]);

  const cellFlags = pendingCellFlags || sourceCellFlags;

  useEffect(() => {
    if (!pendingCellFlags) {
      return;
    }

    if (areTabularCellFlagsEqual(pendingCellFlags, sourceCellFlags)) {
      setPendingCellFlags(null);
    }
  }, [pendingCellFlags, sourceCellFlags]);

  const flushFallbackFlags = useCallback(async () => {
    if (fallbackSyncInFlightRef.current || !projectId || !canvasId) {
      return;
    }

    fallbackSyncInFlightRef.current = true;

    let didPersist = false;

    try {
      while (fallbackQueuedFlagsRef.current) {
        const nextFlags = fallbackQueuedFlagsRef.current;
        fallbackQueuedFlagsRef.current = null;

        try {
          const latest = await api.getPersonalNote(projectId, canvasId);
          const parsed = parsePersonalNotePayload(latest.note);

          await api.updatePersonalNote(
            projectId,
            canvasId,
            serializePersonalNotePayload({
              note: parsed.note,
              tabularCellFlags: nextFlags,
            })
          );
          didPersist = true;
        } catch {
          // Re-queue on failure; next edit will retry.
          fallbackQueuedFlagsRef.current = nextFlags;
          break;
        }
      }

      if (didPersist) {
        await refetchPersonalNote();
      }
    } finally {
      fallbackSyncInFlightRef.current = false;
    }
  }, [api, canvasId, projectId, refetchPersonalNote]);

  const scheduleFallbackFlush = useCallback(() => {
    if (typeof window === 'undefined') {
      void flushFallbackFlags();
      return;
    }

    if (fallbackFlushTimerRef.current !== null) {
      window.clearTimeout(fallbackFlushTimerRef.current);
    }

    fallbackFlushTimerRef.current = window.setTimeout(() => {
      fallbackFlushTimerRef.current = null;
      void flushFallbackFlags();
    }, 300);
  }, [flushFallbackFlags]);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined' && fallbackFlushTimerRef.current !== null) {
        window.clearTimeout(fallbackFlushTimerRef.current);
        fallbackFlushTimerRef.current = null;
      }
    },
    []
  );

  const persistCellFlags = useCallback(
    (nextFlags: TabularCellFlagMap) => {
      if (areTabularCellFlagsEqual(cellFlags, nextFlags)) {
        return;
      }

      setPendingCellFlags(nextFlags);

      if (!cellFlagsField) {
        if (!projectId || !canvasId) {
          setPendingCellFlags(null);
          return;
        }

        fallbackQueuedFlagsRef.current = nextFlags;
        scheduleFallbackFlush();
        return;
      }

      cellFlagsField.setValue(serializeTabularCellFlags(nextFlags));
    },
    [canvasId, cellFlags, cellFlagsField, projectId, scheduleFallbackFlush]
  );

  const activeCellColumnKey =
    tableActiveCell && tableActiveCell.col >= 0 ? visibleColumnKeys[tableActiveCell.col] : undefined;

  const columnLabelsByKey = useMemo(() => {
    const labels = new Map<string, string>();
    for (const column of headerColumns) {
      labels.set(column.key, column.label);
    }
    return labels;
  }, [headerColumns]);

  const activeCellColumnLabel = useMemo(() => {
    if (!activeCellColumnKey) {
      return undefined;
    }

    return columnLabelsByKey.get(activeCellColumnKey) || activeCellColumnKey;
  }, [activeCellColumnKey, columnLabelsByKey]);

  const getCellFlag = useCallback(
    (rowIndex: number, columnKey: string) => cellFlags[getTabularCellFlagKey(rowIndex, columnKey)],
    [cellFlags]
  );

  const activeCellFlag = useMemo(() => {
    if (!tableActiveCell || !activeCellColumnKey) {
      return undefined;
    }
    return getCellFlag(tableActiveCell.row, activeCellColumnKey);
  }, [activeCellColumnKey, getCellFlag, tableActiveCell]);

  const activeCellIsFlagged = useMemo(() => isTabularCellFlagged(activeCellFlag), [activeCellFlag]);

  const activeCellIsNoted = useMemo(() => isTabularCellNote(activeCellFlag), [activeCellFlag]);

  const isCellFlagged = useCallback(
    (rowIndex: number, columnKey: string) => isTabularCellFlagged(getCellFlag(rowIndex, columnKey)),
    [getCellFlag]
  );

  const isCellNoted = useCallback(
    (rowIndex: number, columnKey: string) => isTabularCellNote(getCellFlag(rowIndex, columnKey)),
    [getCellFlag]
  );

  const flaggedCells = useMemo<TabularCellReviewItem[]>(() => {
    return Object.values(cellFlags)
      .filter(flag => isTabularCellFlagged(flag))
      .sort((a, b) => {
        if (a.rowIndex !== b.rowIndex) {
          return a.rowIndex - b.rowIndex;
        }
        return a.columnKey.localeCompare(b.columnKey);
      })
      .map(flag => {
        return {
          key: getTabularCellFlagKey(flag.rowIndex, flag.columnKey),
          rowIndex: flag.rowIndex,
          columnKey: flag.columnKey,
          columnLabel: columnLabelsByKey.get(flag.columnKey) || flag.columnKey,
          isVisibleInTable: visibleColumnKeys.includes(flag.columnKey),
          flaggedAt: flag.flaggedAt,
          comment: flag.comment,
        };
      });
  }, [cellFlags, columnLabelsByKey, visibleColumnKeys]);

  const activeCellComment = activeCellFlag?.comment || '';

  const onRemoveFlag = useCallback(
    (rowIndex: number, columnKey: string) => {
      const key = getTabularCellFlagKey(rowIndex, columnKey);
      const current = cellFlags[key];
      if (!isTabularCellFlagged(current)) {
        return;
      }

      const next = { ...cellFlags };
      delete next[key];
      persistCellFlags(next);
    },
    [cellFlags, persistCellFlags]
  );

  const onToggleCellFlag = useCallback(
    (rowIndex: number, columnKey: string) => {
      const key = getTabularCellFlagKey(rowIndex, columnKey);
      const current = cellFlags[key];

      if (isTabularCellFlagged(current)) {
        const hasComment = !!current?.comment?.trim();
        if (hasComment) {
          persistCellFlags({
            ...cellFlags,
            [key]: {
              ...current,
              status: 'note',
              comment: current.comment?.trim(),
            },
          });
          return;
        }

        const next = { ...cellFlags };
        delete next[key];
        persistCellFlags(next);
        return;
      }

      persistCellFlags({
        ...cellFlags,
        [key]: {
          ...(current || {}),
          rowIndex,
          columnKey,
          flaggedAt: current?.flaggedAt || new Date().toISOString(),
          status: 'flag',
        },
      });
    },
    [cellFlags, persistCellFlags]
  );

  const onToggleActiveCellFlag = useCallback(() => {
    if (!tableActiveCell || !activeCellColumnKey) {
      return;
    }

    onToggleCellFlag(tableActiveCell.row, activeCellColumnKey);
  }, [activeCellColumnKey, onToggleCellFlag, tableActiveCell]);

  const onConvertFlagToNote = useCallback(
    (rowIndex: number, columnKey: string) => {
      const key = getTabularCellFlagKey(rowIndex, columnKey);
      const current = cellFlags[key];
      if (!isTabularCellFlagged(current)) {
        return;
      }

      persistCellFlags({
        ...cellFlags,
        [key]: {
          ...current,
          status: 'note',
        },
      });
    },
    [cellFlags, persistCellFlags]
  );

  const onClearAllFlags = useCallback(() => {
    const next: TabularCellFlagMap = {};
    for (const item of Object.values(cellFlags)) {
      if (!isTabularCellNote(item)) {
        continue;
      }
      next[getTabularCellFlagKey(item.rowIndex, item.columnKey)] = item;
    }
    persistCellFlags(next);
  }, [cellFlags, persistCellFlags]);

  const onUpdateActiveCellComment = useCallback(
    (nextComment: string) => {
      if (!tableActiveCell || !activeCellColumnKey) {
        return;
      }

      const key = getTabularCellFlagKey(tableActiveCell.row, activeCellColumnKey);
      const current = cellFlags[key];
      const hasMeaningfulComment = nextComment.trim().length > 0;

      if (!current && !hasMeaningfulComment) {
        return;
      }

      const next = {
        ...cellFlags,
        [key]: {
          ...(current || {
            rowIndex: tableActiveCell.row,
            columnKey: activeCellColumnKey,
            flaggedAt: new Date().toISOString(),
            status: 'flag' as const,
          }),
          comment: hasMeaningfulComment ? nextComment : undefined,
        },
      };

      persistCellFlags(next);
    },
    [activeCellColumnKey, cellFlags, persistCellFlags, tableActiveCell]
  );

  const onFocusFlaggedCell = useCallback(
    (rowIndex: number, columnKey: string) => {
      const colIndex = visibleColumnKeys.indexOf(columnKey);
      if (colIndex === -1) {
        return;
      }

      setTableActiveCell({ row: rowIndex, col: colIndex });

      if (typeof window !== 'undefined') {
        const cellElementId = getTabularCellElementId(rowIndex, columnKey, useLegacyTopLevelLayout);
        window.requestAnimationFrame(() => {
          const cell = document.getElementById(cellElementId);
          if (cell) {
            cell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        });
      }
    },
    [setTableActiveCell, useLegacyTopLevelLayout, visibleColumnKeys]
  );

  const removeRowAndSyncFlags = useCallback(() => {
    const removedRowIndex = removeRowFromFooter();
    if (removedRowIndex === null) {
      return;
    }

    const shifted = shiftTabularCellFlagsAfterRowRemoval(cellFlags, removedRowIndex);
    persistCellFlags(shifted);
  }, [cellFlags, persistCellFlags, removeRowFromFooter]);

  return {
    canPersistFlags: !!cellFlagsField || (!!projectId && !!canvasId),
    activeCellColumnKey,
    activeCellColumnLabel,
    activeCellIsFlagged,
    activeCellIsNoted,
    activeCellComment,
    flaggedCells,
    isCellFlagged,
    isCellNoted,
    onToggleCellFlag,
    onToggleActiveCellFlag,
    onUpdateActiveCellComment,
    onFocusFlaggedCell,
    onRemoveFlag,
    onConvertFlagToNote,
    onClearAllFlags,
    removeRowAndSyncFlags,
  };
}
