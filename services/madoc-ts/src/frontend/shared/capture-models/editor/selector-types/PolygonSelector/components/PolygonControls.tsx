import React, { useCallback, useEffect, useRef, useState } from 'react';
import { type SVGTheme, useAtlasStore } from 'react-iiif-vault';
import { useStore } from 'zustand';
import { CanvasViewerButton } from '../../../../../atoms/CanvasViewerGrid';
import { CanvasViewerButtonProps } from '../../../../../atoms/CanvasViewerButton';
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
import { PanIcon } from '../../../../../icons/PanIcon';
import { CusorIcon } from '../../../../../icons/CursorIcon';
import { SquareIcon } from '../../../../../icons/SquareIcon';
import { ShapesIcon } from '../../../../../icons/ShapesIcon';

export const SVG_EDITOR_THEMES: Array<{ name: string; theme: Partial<SVGTheme> }> = [
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

function PolygonButton(props: CanvasViewerButtonProps) {
  return (
    <CanvasViewerButton
      type="button"
      className="!h-10 !w-10 !justify-center !rounded !bg-transparent !p-0 !text-neutral-950 hover:!bg-[color-mix(in_srgb,var(--madoc-accent,#4265e9)_12%,white)] data-[active=true]:!bg-[var(--madoc-accent,#4265e9)] data-[active=true]:!text-[var(--madoc-accent-text,#fff)] data-[active=true]:hover:!bg-[var(--madoc-accent,#4265e9)]"
      {...props}
    />
  );
}

export function PolygonControls() {
  const store = useAtlasStore();
  const state = useStore(store, currentState => currentState.polygonState);
  const switchTool = useStore(store, currentState => currentState.switchTool);
  const polygon = useStore(store, currentState => currentState.polygon);
  const [storedThemeKey, setStoredThemeKey] = useLocalStorage<number>('poly-theme', 0);
  const themeKey = Number.isFinite(Number(storedThemeKey))
    ? Math.abs(Math.trunc(Number(storedThemeKey))) % SVG_EDITOR_THEMES.length
    : 0;
  const selectedTheme = SVG_EDITOR_THEMES[themeKey] || SVG_EDITOR_THEMES[0];
  const [shapesOpen, setShapesOpen] = useState(false);
  const shapesRef = useRef<HTMLDivElement>(null);
  const currentTool = state.currentTool;
  const showShapes = (polygon?.points.length || 0) === 0 || polygon?.open;
  const shapeSelected =
    currentTool === 'lineBox' ||
    (currentTool === 'stamp' && ['triangle', 'hexagon', 'circle'].includes(state.selectedStamp?.id || ''));
  const selectShape = (switchToShape: () => void) => {
    switchToShape();
    setShapesOpen(false);
    shapesRef.current?.querySelector('button')?.focus();
  };
  const cycleTheme = useCallback(() => {
    setStoredThemeKey(previousThemeKey => {
      const previous = Number(previousThemeKey);
      const index = Number.isFinite(previous) ? Math.abs(Math.trunc(previous)) : 0;
      return (index + 1) % SVG_EDITOR_THEMES.length;
    });
  }, [setStoredThemeKey]);

  useEffect(() => {
    if (!shapesOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!shapesRef.current?.contains(event.target as Node)) setShapesOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShapesOpen(false);
        shapesRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [shapesOpen]);

  return (
    <>
      <div role="group" aria-label="Viewer tools" className="flex gap-1 rounded-md bg-white p-1 shadow-md">
        <PolygonButton onClick={switchTool.hand} data-active={currentTool === 'hand'} title="Pan" aria-label="Pan">
          <PanIcon />
        </PolygonButton>
        <PolygonButton
          onClick={switchTool.pointer}
          data-active={currentTool === 'pointer'}
          title="Select"
          aria-label="Select"
        >
          <CusorIcon />
        </PolygonButton>
        <PolygonButton onClick={switchTool.remove} title="Delete shape" aria-label="Delete shape">
          <DeleteForeverIcon />
        </PolygonButton>
      </div>
      {showShapes ? (
        <div role="group" aria-label="Drawing tools" className="flex gap-1 rounded-md bg-white p-1 shadow-md">
          <PolygonButton onClick={switchTool.box} data-active={currentTool === 'box'} title="Rectangle" aria-label="Rectangle">
            <SquareIcon />
          </PolygonButton>
          <PolygonButton
            onClick={switchTool.pen}
            data-active={currentTool === 'pen' && !state.selectedStamp}
            title="Polygon"
            aria-label="Polygon"
          >
            <PolygonIcon />
          </PolygonButton>
          <PolygonButton onClick={switchTool.draw} data-active={currentTool === 'pencil'} title="Draw" aria-label="Draw">
            <DrawIcon />
          </PolygonButton>
          <PolygonButton onClick={switchTool.line} data-active={currentTool === 'line'} title="Line" aria-label="Line">
            <LineIcon />
          </PolygonButton>
          <div ref={shapesRef} className="relative">
            <PolygonButton
              onClick={() => setShapesOpen(open => !open)}
              data-active={shapeSelected || shapesOpen}
              aria-expanded={shapesOpen}
              aria-haspopup="true"
              aria-label="More shapes"
              title="More shapes"
            >
              <ShapesIcon />
            </PolygonButton>
            {shapesOpen ? (
              <div role="group" aria-label="More shapes" className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 rounded-md bg-white p-1 shadow-md">
                <PolygonButton
                  onClick={() => selectShape(switchTool.lineBox)}
                  data-active={currentTool === 'lineBox'}
                  title="Line box"
                  aria-label="Line box"
                >
                  <LineBoxIcon />
                </PolygonButton>
                <PolygonButton
                  onClick={() => selectShape(switchTool.triangle)}
                  data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'triangle'}
                  title="Triangle"
                  aria-label="Triangle"
                >
                  <TriangleIcon />
                </PolygonButton>
                <PolygonButton
                  onClick={() => selectShape(switchTool.hexagon)}
                  data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'hexagon'}
                  title="Hexagon"
                  aria-label="Hexagon"
                >
                  <HexagonIcon />
                </PolygonButton>
                <PolygonButton
                  onClick={() => selectShape(switchTool.circle)}
                  data-active={currentTool === 'stamp' && state.selectedStamp?.id === 'circle'}
                  title="Circle"
                  aria-label="Circle"
                >
                  <CircleIcon />
                </PolygonButton>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div role="group" aria-label="Theme" className="flex rounded-md bg-white p-1 shadow-md">
        <PolygonButton onClick={cycleTheme} title={`Theme: ${selectedTheme.name}`} aria-label={`Theme: ${selectedTheme.name}`}>
          <ThemeIcon />
        </PolygonButton>
      </div>
    </>
  );
}
