import { useEffect, useMemo, useRef, useState } from 'react';
import { useResizeLayout } from '@/frontend/shared/hooks/use-resize-layout';
import { useVerticalDragResize } from '@/frontend/shared/hooks/use-vertical-drag-resize';
import { clampToRange } from '@/frontend/shared/utility/tabular-net-config';
import { CONTRIBUTOR_EDITOR_CANVAS_SPLIT, CONTRIBUTOR_EDITOR_TABLE_SPLIT } from './tabular-project-custom-editor-utils';

const CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT = 12;
const CONTRIBUTOR_EDITOR_MIN_CANVAS_HEIGHT = 220;
const CONTRIBUTOR_EDITOR_MIN_TABLE_HEIGHT = 280;
const CONTRIBUTOR_EDITOR_SIDEBAR_MIN_WIDTH = 320;
const CONTRIBUTOR_EDITOR_SIDEBAR_AUTO_COLLAPSE_THRESHOLD = CONTRIBUTOR_EDITOR_SIDEBAR_MIN_WIDTH + 8;

function parsePixelWidth(value: string | number | undefined) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const numericValue = Number.parseFloat(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
}

type UseTabularEditorLayoutOptions = {
  defaultCanvasSplitPct?: number;
  minCanvasHeight?: number;
  minTableHeight?: number;
};

export function useTabularEditorLayout(options: UseTabularEditorLayoutOptions = {}) {
  const {
    defaultCanvasSplitPct,
    minCanvasHeight = CONTRIBUTOR_EDITOR_MIN_CANVAS_HEIGHT,
    minTableHeight = CONTRIBUTOR_EDITOR_MIN_TABLE_HEIGHT,
  } = options;
  const [isSidebarPanelOpen, setIsSidebarPanelOpen] = useState(false);
  const [isCanvasTableDividerHover, setIsCanvasTableDividerHover] = useState(false);
  const [isCanvasTableResizing, setIsCanvasTableResizing] = useState(false);
  const wasSidebarDraggingRef = useRef(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const splitResizeContextRef = useRef<{
    availableHeight: number;
    lowerBound: number;
    upperBound: number;
    startCanvasSplitPct: number;
  } | null>(null);

  const initialCanvasSplit = useMemo(() => {
    if (typeof defaultCanvasSplitPct === 'number' && Number.isFinite(defaultCanvasSplitPct)) {
      return clampToRange(defaultCanvasSplitPct, 5, 95);
    }

    const defaultCanvasSplit = Number.parseFloat(CONTRIBUTOR_EDITOR_CANVAS_SPLIT);
    const defaultTableSplit = Number.parseFloat(CONTRIBUTOR_EDITOR_TABLE_SPLIT);
    const safeCanvasSplit = Number.isFinite(defaultCanvasSplit) ? defaultCanvasSplit : 58;
    const safeTableSplit = Number.isFinite(defaultTableSplit) ? defaultTableSplit : 42;
    const total = safeCanvasSplit + safeTableSplit || 100;

    return (safeCanvasSplit / total) * 100;
  }, [defaultCanvasSplitPct]);

  const [canvasSplitPct, setCanvasSplitPct] = useState(initialCanvasSplit);

  const startCanvasTableResize = useVerticalDragResize(
    {
      onStart: () => {
        setIsCanvasTableResizing(true);

        const splitContainer = splitContainerRef.current;
        if (!splitContainer) {
          splitResizeContextRef.current = null;
          setIsCanvasTableResizing(false);
          return false;
        }

        const bounds = splitContainer.getBoundingClientRect();
        const availableHeight = Math.max(1, bounds.height - CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT);
        const minCanvasPct = clampToRange((minCanvasHeight / availableHeight) * 100, 5, 95);
        const maxCanvasPct = clampToRange(100 - (minTableHeight / availableHeight) * 100, 5, 95);
        const lowerBound = Math.min(minCanvasPct, maxCanvasPct);
        const upperBound = Math.max(minCanvasPct, maxCanvasPct);

        splitResizeContextRef.current = {
          availableHeight,
          lowerBound,
          upperBound,
          startCanvasSplitPct: canvasSplitPct,
        };
      },
      onDrag: deltaY => {
        const resizeContext = splitResizeContextRef.current;
        if (!resizeContext) {
          return;
        }

        const deltaPct = (deltaY / resizeContext.availableHeight) * 100;
        setCanvasSplitPct(
          clampToRange(resizeContext.startCanvasSplitPct + deltaPct, resizeContext.lowerBound, resizeContext.upperBound)
        );
      },
      onEnd: () => {
        splitResizeContextRef.current = null;
        setIsCanvasTableResizing(false);
      },
    },
    [canvasSplitPct, minCanvasHeight, minTableHeight]
  );

  const isCanvasTableDividerActive = isCanvasTableDividerHover || isCanvasTableResizing;

  const { widthB, refs, isDragging } = useResizeLayout('tabular-custom-editor-sidebar', {
    left: true,
    widthB: '420px',
    maxWidthPx: 620,
    minWidthPx: CONTRIBUTOR_EDITOR_SIDEBAR_MIN_WIDTH,
    onDragEnd: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    },
  });

  useEffect(() => {
    const justFinishedDragging = wasSidebarDraggingRef.current && !isDragging;
    wasSidebarDraggingRef.current = isDragging;

    if (!justFinishedDragging || !isSidebarPanelOpen) {
      return;
    }

    const measuredWidth = refs.resizableDiv.current?.getBoundingClientRect().width;
    const fallbackWidth = parsePixelWidth(widthB);
    const sidebarWidth = Number.isFinite(measuredWidth) ? measuredWidth : fallbackWidth;

    if (sidebarWidth != null && sidebarWidth <= CONTRIBUTOR_EDITOR_SIDEBAR_AUTO_COLLAPSE_THRESHOLD) {
      setIsSidebarPanelOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }
  }, [isDragging, isSidebarPanelOpen, refs.resizableDiv, widthB]);

  return {
    widthB,
    refs,
    isSidebarPanelOpen,
    setIsSidebarPanelOpen,
    splitContainerRef,
    canvasSplitPct,
    startCanvasTableResize,
    isCanvasTableDividerActive,
    setIsCanvasTableDividerHover,
    splitDividerHeight: CONTRIBUTOR_EDITOR_SPLIT_DIVIDER_HEIGHT,
  };
}
