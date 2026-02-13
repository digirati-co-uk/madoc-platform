import { HTMLPortal, useAtlas } from '@atlas-viewer/atlas';
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  type SVGTheme,
  useAtlasStore,
  useCurrentAnnotationRequest,
  useEvent,
  useRequestAnnotation,
  useSvgEditor,
} from 'react-iiif-vault';
import { CanvasViewerButton } from '../../../../../atoms/CanvasViewerGrid';
import { useLocalStorage } from '../../../../../hooks/use-local-storage';
import { DeleteForeverIcon } from '../../../../../icons/DeleteForeverIcon';
import { DrawIcon } from '../../../../../icons/DrawIcon';
import { HexagonIcon } from '../../../../../icons/HexagonIcon';
import { LineBoxIcon } from '../../../../../icons/LineBoxIcon';
import { LineIcon } from '../../../../../icons/LineIcon';
import { PolygonIcon } from '../../../../../icons/PolgonIcon';
import { CircleIcon } from '../../../../../icons/CircleIcon';
import { TriangleIcon } from '../../../../../icons/TriangleIcon';
import { ThemeIcon } from '../../../../../icons/ThemeIcon';
import { InputShape } from 'polygon-editor';
import { useStore } from 'zustand';
import { PanIcon } from '../../../../../icons/PanIcon';
import { CusorIcon } from '../../../../../icons/CursorIcon';

const PROXIMITY_MULTIPLIER = 1.35;
const SVG_EDITOR_THEMES: Array<{ name: string; theme: Partial<SVGTheme> }> = [
  {
    name: 'Default',
    theme: {},
  },
  {
    name: 'High contrast',
    theme: {
      shapeStroke: '#fff',
      lineStroke: '#fff',
      activeLineStroke: '#000',
      controlFill: '#000',
      boundingBoxStroke: '#fff',
      boundingBoxDottedStroke: '#000',
    },
  },
  {
    name: 'Lightsaber',
    theme: {
      shapeStroke: '#fff',
      lineStroke: '#fff',
      activeLineStroke: '#3844ff',
      controlFill: '#fff',
      boundingBoxStroke: '#3844ff',
      boundingBoxDottedStroke: '#fff',
    },
  },
  {
    name: 'Bright',
    theme: {
      shapeStroke: '#25d527',
      lineStroke: '#25d527',
      activeLineStroke: '#a916ff',
      controlFill: '#a916ff',
      boundingBoxStroke: '#25d527',
      boundingBoxDottedStroke: '#a916ff',
    },
  },
  {
    name: 'Pink',
    theme: {
      shapeStroke: '#fff',
      lineStroke: '#fff',
      activeLineStroke: '#ff00ff',
      controlFill: '#ff00ff',
      boundingBoxStroke: '#fff',
      boundingBoxDottedStroke: '#ff00ff',
    },
  },
  {
    name: 'Fine (dark)',
    theme: {
      shapeStroke: '#000',
      lineStroke: '#000',
      activeLineStroke: '#000',
      controlFill: '#fff',
      boundingBoxStroke: '#000',
      boundingBoxDottedStroke: '#000',
    },
  },
  {
    name: 'Fine (light)',
    theme: {
      shapeStroke: '#fff',
      lineStroke: '#fff',
      activeLineStroke: '#fff',
      controlFill: '#000',
      boundingBoxStroke: '#fff',
      boundingBoxDottedStroke: '#fff',
    },
  },
];

export interface CreateCustomShapeProps {
  image: { width: number; height: number };
  shape?: InputShape;
  updateShape: (shape: InputShape) => void;
}

export function CreateCustomShape(props: CreateCustomShapeProps) {
  const atlas = useAtlas();
  const { image } = props;
  const [storedThemeKey, setStoredThemeKey] = useLocalStorage<number>('poly-theme', 0);
  const themeKey = Number.isFinite(Number(storedThemeKey))
    ? Math.abs(Math.trunc(Number(storedThemeKey))) % SVG_EDITOR_THEMES.length
    : 0;
  const selectedTheme = SVG_EDITOR_THEMES[themeKey] || SVG_EDITOR_THEMES[0];
  const selectorId = props.shape?.id;
  const selectorIdRef = useRef(selectorId);
  const initialShapeRef = useRef<InputShape>(props.shape || { points: [], open: true });
  const requestedForIdRef = useRef<string | null>(null);
  const store = useAtlasStore();
  const mode = useStore(store, state => state.mode);
  const tool = useStore(store, state => state.tool);
  const switchTool = useStore(store, state => state.switchTool);
  const polygon = useStore(store, state => state.polygon);
  const runtime = useStore(store, state => state.runtime);
  const currentRequest = useCurrentAnnotationRequest();
  const { requestId, requestAnnotation, cancelRequest } = useRequestAnnotation();
  const requestAnnotationRef = useRef(requestAnnotation);
  const cancelRequestRef = useRef(cancelRequest);
  const debugLog = useCallback((message: string, payload?: any) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.localStorage.getItem('madoc:polygon-debug') !== '1') {
      return;
    }
    console.debug(`[madoc:polygon] ${message}`, payload);
  }, []);

  useEffect(() => {
    selectorIdRef.current = selectorId;
  }, [selectorId]);

  useEffect(() => {
    requestAnnotationRef.current = requestAnnotation;
  }, [requestAnnotation]);

  useEffect(() => {
    cancelRequestRef.current = cancelRequest;
  }, [cancelRequest]);

  const {
    helper,
    defs,
    editor,
    state,
    transitionDirection,
    isSplitting,
    transitionRotate,
    isHoveringPoint,
    isAddingPoint,
    currentTool,
    currentShape,
  } = useSvgEditor({
    onChange: props.updateShape,
    image: props.image,
    hideShapeLines: true,
    theme: selectedTheme.theme,
  });

  const cycleTheme = useCallback(() => {
    setStoredThemeKey(previousThemeKey => {
      const previous = Number(previousThemeKey);
      const index = Number.isFinite(previous) ? Math.abs(Math.trunc(previous)) : 0;
      return (index + 1) % SVG_EDITOR_THEMES.length;
    });
  }, [setStoredThemeKey]);

  useEvent<any, any>(
    'atlas.annotation-request' as any,
    data => {
      debugLog('event atlas.annotation-request', data);
    },
    [debugLog]
  );

  useEvent<any, any>(
    'atlas.polygon-update' as any,
    data => {
      if (requestId && data.id && data.id !== requestId) {
        return;
      }
      const nextShape: InputShape = {
        id: selectorId || requestId || data.id,
        open: data.open,
        points: data.points || [],
      };
      props.updateShape(nextShape);
      debugLog('event atlas.polygon-update', data);
    },
    [debugLog, props.updateShape, requestId, selectorId]
  );

  useEvent<any, any>(
    'atlas.annotation-completed' as any,
    data => {
      debugLog('event atlas.annotation-completed', data);
    },
    [debugLog]
  );

  useEvent<any, any>(
    'atlas.request-cancelled' as any,
    data => {
      debugLog('event atlas.request-cancelled', data);
    },
    [debugLog]
  );

  useEffect(() => {
    if (!requestedForIdRef.current) {
      initialShapeRef.current = props.shape || { points: [], open: true };
    }
  }, [props.shape]);

  useEffect(() => {
    if (!requestId || requestedForIdRef.current === requestId) {
      return;
    }
    requestedForIdRef.current = requestId;

    const initialShape = initialShapeRef.current;
    const request = {
      type: 'polygon' as const,
      points: initialShape.points || [],
      open: initialShape.open ?? true,
    };
    debugLog('requestAnnotation init', {
      selectorId: selectorIdRef.current,
      requestId,
      points: request.points.length,
      open: request.open,
      toolId: 'pen',
    });

    void requestAnnotationRef.current(request, { toolId: 'pen' }).then(response => {
      debugLog('requestAnnotation resolved', {
        selectorId: selectorIdRef.current,
        requestId,
        hasResponse: !!response,
        cancelled: response ? (response as any).cancelled : undefined,
      });
    });

    return () => {
      debugLog('requestAnnotation cleanup', { selectorId: selectorIdRef.current, requestId });
      cancelRequestRef.current();
    };
  }, [debugLog, requestId]);

  useEffect(() => {
    const setScaledProximity = () => {
      const rawScale = (runtime as any)?._lastGoodScale;
      if (!rawScale || Number.isNaN(rawScale)) {
        return;
      }
      const targetScale = (1 / rawScale) * PROXIMITY_MULTIPLIER;
      if (typeof (helper as any).setScale === 'function') {
        (helper as any).setScale(targetScale);
        debugLog('proximity scale applied', { rawScale, targetScale, multiplier: PROXIMITY_MULTIPLIER });
      }
    };

    if (!runtime?.world) {
      return;
    }

    setScaledProximity();
    const removeLayoutSubscription = runtime.world.addLayoutSubscriber((event: string) => {
      if (event === 'event-activation' || event === 'zoom-to' || event === 'go-home') {
        setScaledProximity();
      }
    });

    return () => {
      if (typeof removeLayoutSubscription === 'function') {
        removeLayoutSubscription();
      }
    };
  }, [debugLog, helper, runtime]);

  useEffect(() => {
    debugLog('render state', {
      selectorId,
      requestId,
      mode,
      tool,
      request: currentRequest
        ? {
            type: currentRequest.type,
            points: (currentRequest as any).points?.length,
            open: (currentRequest as any).open,
          }
        : null,
      polygon: polygon
        ? {
            id: polygon.id,
            points: polygon.points.length,
            open: polygon.open,
          }
        : null,
      currentShape: currentShape
        ? {
            id: currentShape.id,
            points: currentShape.points.length,
            open: currentShape.open,
          }
        : null,
      editorVisible: !!editor,
      actionIntentType: state.actionIntentType,
      transitionIntentType: state.transitionIntentType,
    });
  }, [
    currentRequest,
    currentShape,
    debugLog,
    editor,
    mode,
    polygon,
    requestId,
    selectorId,
    state.actionIntentType,
    state.transitionIntentType,
    tool,
  ]);

  const mouseMove = useCallback(
    (e: any) => {
      if (e.button === 2) {
        return;
      }
      helper.pointer([[~~e.atlas.x, ~~e.atlas.y]]);
    },
    [helper]
  );

  const mouseDown = useCallback(
    (e: any) => {
      if (e.button === 2) {
        return;
      }
      helper.pointerDown();
    },
    [helper]
  );

  const mouseUp = useCallback(
    (e: any) => {
      if (e.button === 2) {
        return;
      }
      helper.pointerUp();
    },
    [helper]
  );

  useEffect(() => {
    const handler = (e: any) => {
      helper.key.up(e.key);
    };

    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    };
  }, [helper]);

  useEffect(() => {
    const handler = (e: any) => {
      const target = e.target as HTMLElement | null;
      if (
        (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) ||
        target?.isContentEditable ||
        (document.activeElement &&
          (document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement ||
            document.activeElement.isContentEditable))
      ) {
        return;
      }
      helper.key.down(e.key);
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [helper]);

  useEffect(() => {
    const wrapperClasses: Array<`atlas-cursor-${string}`> = [];
    if (transitionDirection) {
      wrapperClasses.push(`atlas-cursor-${transitionDirection}`);
    }
    if (state.actionIntentType === 'cut-line' && state.modifiers?.Shift) {
      wrapperClasses.push('atlas-cursor-cut');
    }
    if (isHoveringPoint || state.transitionIntentType === 'move-shape' || state.transitionIntentType === 'move-point') {
      wrapperClasses.push('atlas-cursor-move');
    }
    if (isAddingPoint) {
      wrapperClasses.push('atlas-cursor-crosshair');
    }
    if (isSplitting) {
      wrapperClasses.push('atlas-cursor-copy');
    }
    if (transitionRotate) {
      wrapperClasses.push('atlas-cursor-rotate');
    }
    if (state.transitionIntentType === 'draw-shape') {
      wrapperClasses.push('atlas-cursor-draw');
    }

    if (atlas?.canvas) {
      atlas.canvas.classList.add(...wrapperClasses);
    }
    return () => {
      if (atlas?.canvas) {
        atlas.canvas.classList.remove(...wrapperClasses);
      }
    };
  }, [
    atlas?.canvas,
    isAddingPoint,
    isHoveringPoint,
    isSplitting,
    state.modifiers?.Shift,
    state.actionIntentType,
    state.transitionIntentType,
    transitionDirection,
    transitionRotate,
  ]);

  const controls = document.getElementById('atlas-controls');
  const showShapes = (currentShape?.points.length || 0) === 0;

  const controlsComponent = (
    <>
      <CanvasViewerButton onClick={switchTool.pointer} data-active={currentTool === 'pointer'}>
        <CusorIcon />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={switchTool.hand} data-active={currentTool === 'hand'}>
        <PanIcon />
      </CanvasViewerButton>
      <CanvasViewerButton onClick={cycleTheme} title={`Theme: ${selectedTheme.name}`}>
        <ThemeIcon />
      </CanvasViewerButton>
      {showShapes ? (
        <>
          <CanvasViewerButton onClick={switchTool.pen} data-active={currentTool === 'pen' && !state.selectedStamp}>
            <PolygonIcon />
          </CanvasViewerButton>
          <CanvasViewerButton onClick={switchTool.draw} data-active={currentTool === 'pencil'}>
            <DrawIcon />
          </CanvasViewerButton>
          <CanvasViewerButton onClick={switchTool.line} data-active={currentTool === 'line'}>
            <LineIcon />
          </CanvasViewerButton>
          <CanvasViewerButton onClick={switchTool.lineBox} data-active={currentTool === 'lineBox'}>
            <LineBoxIcon />
          </CanvasViewerButton>
          <CanvasViewerButton
            onClick={switchTool.triangle}
            data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'triangle'}
          >
            <TriangleIcon />
          </CanvasViewerButton>
          <CanvasViewerButton
            onClick={switchTool.hexagon}
            data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'hexagon'}
          >
            <HexagonIcon />
          </CanvasViewerButton>
          <CanvasViewerButton
            onClick={switchTool.circle}
            data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'circle'}
          >
            <CircleIcon />
          </CanvasViewerButton>
        </>
      ) : null}
      {state.showBoundingBox ? (
        <CanvasViewerButton onClick={switchTool.remove}>
          <DeleteForeverIcon style={{ color: 'red' }} />
        </CanvasViewerButton>
      ) : null}
    </>
  );

  return (
    <world-object
      height={image.height}
      width={image.width}
      onMouseMove={mouseMove}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseLeave={helper.blur}
    >
      <HTMLPortal relative={true} interactive={false}>
        <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${image.width} ${image.height}`} tabIndex={-1}>
            <title>Annotation Editor</title>
            <defs>{defs}</defs>
            {editor}
          </svg>
        </div>
        {controls ? createPortal(controlsComponent, controls) : null}
      </HTMLPortal>
    </world-object>
  );
}
