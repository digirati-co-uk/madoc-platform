import { HTMLPortal, useAtlas } from '@atlas-viewer/atlas';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CanvasViewerButton, CanvasViewerButtonMenu } from '../../../../../atoms/CanvasViewerGrid';
import { useLocalStorage } from '../../../../../hooks/use-local-storage';
import { DeleteForeverIcon } from '../../../../../icons/DeleteForeverIcon';
import { DrawIcon } from '../../../../../icons/DrawIcon';
import { HexagonIcon } from '../../../../../icons/HexagonIcon';
import { PolygonIcon } from '../../../../../icons/PolgonIcon';
import { ShapesIcon } from '../../../../../icons/ShapesIcon';
import { SquareIcon } from '../../../../../icons/SquareIcon';
import { ThemeIcon } from '../../../../../icons/ThemeIcon';
import { TriangleIcon } from '../../../../../icons/TriangleIcon';
import { useSvgEditor } from '../helpers/use-svg-editor';
import { ShapeToolProps } from '../PolygonSelector.types';

const themes = [
  {
    name: 'Default',
    outer: { borderWidth: 4, borderColor: 'rgba(255, 255, 255, .4)' },
    inner: { borderWidth: 2, borderColor: '#000' },
  },
  {
    name: 'High contrast',
    outer: { borderWidth: 3, borderColor: '#fff' },
    inner: { borderWidth: 1, borderColor: '#000' },
  },
  {
    name: 'Lightsaber',
    outer: { borderWidth: '4', borderColor: 'rgba(56,68,255,0.64)' },
    inner: { borderWidth: '2', borderColor: '#fff' },
  },
  {
    name: 'Bright',
    outer: { borderWidth: '6', borderColor: '#25d527' },
    inner: { borderWidth: '3', borderColor: '#a916ff' },
  },
  {
    name: 'pink',
    outer: { borderWidth: '4', borderColor: '#ff00ff' },
    inner: { borderWidth: '2', borderColor: '#ffffff' },
  },
  {
    name: 'fine (dark)',
    outer: { borderWidth: '1', borderColor: '#000000' },
    inner: {},
  },
  {
    name: 'fine (light)',
    outer: { borderWidth: '1', borderColor: '#FFF' },
    inner: {},
  },
];

export function CreateCustomShape(props: ShapeToolProps) {
  const { t } = useTranslation();
  const [themeKey, setThemeKey] = useLocalStorage('poly-theme', 0);
  const cycleTheme = () => {
    setThemeKey((themeKey + 1) % themes.length);
  };
  const theme = themes[themeKey] || themes[0];
  const atlas = useAtlas();
  const { image } = props;
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
    isStamping,
  } = useSvgEditor(
    {
      currentShape: props.shape || null,
      onChange: props.updateShape,
      image: props.image,
      hideShapeLines: true,
    },
    []
  );

  const mouseMove = (e: any) => {
    helper.pointer([[~~e.atlas.x, ~~e.atlas.y]]);
  };

  useEffect(() => {
    const handler = (e: any) => {
      helper.key.up(e.key);
    };

    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    };
  }, []);
  useEffect(() => {
    const handler = (e: any) => {
      helper.key.down(e.key);
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);

  useEffect(() => {
    const wrapperClasses: string[] = [];
    if (transitionDirection) {
      wrapperClasses.push(transitionDirection);
    }
    if (isHoveringPoint || state.transitionIntentType === 'move-shape' || state.transitionIntentType === 'move-point') {
      wrapperClasses.push('move');
    }
    if (isAddingPoint) {
      wrapperClasses.push('crosshair');
    }
    if (isSplitting) {
      wrapperClasses.push('copy');
    }
    if (transitionRotate) {
      wrapperClasses.push('rotate');
    }
    if (state.transitionIntentType === 'draw-shape') {
      wrapperClasses.push('draw');
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
    state.transitionIntentType,
    transitionDirection,
    transitionRotate,
  ]);

  const showShapes = props.shape && props.shape?.points.length === 0;

  const controlsComponent = (
    <>
      {/* @todo pan mode */}
      {/*<CanvasViewerButton>*/}
      {/*  <HomeIcon title={t('polygons__pan', { defaultValue: 'Pan' })} />*/}
      {/*</CanvasViewerButton>*/}
      <CanvasViewerButton onClick={cycleTheme}>
        <ThemeIcon />
      </CanvasViewerButton>
      {showShapes ? (
        <>
          <CanvasViewerButton
            onClick={() => {
              helper.stamps.clear();
              helper.draw.enable();
            }}
            data-active={!state.selectedStamp && showShapes && state.drawMode}
          >
            <DrawIcon />
          </CanvasViewerButton>
          <CanvasViewerButton
            data-active={!state.selectedStamp && showShapes && !state.drawMode}
            onClick={() => {
              helper.stamps.clear();
              helper.draw.disable();
            }}
          >
            <PolygonIcon />
          </CanvasViewerButton>
          <CanvasViewerButtonMenu
            label={'Select shape'}
            items={[
              {
                icon: <SquareIcon />,
                onClick: () => {
                  helper.stamps.square();
                },
                disabled: false,
                label: 'Square',
                selected: state.selectedStamp?.id === 'square',
              },
              {
                icon: <TriangleIcon />,
                onClick: () => {
                  helper.stamps.triangle();
                },
                disabled: false,
                label: 'Triangle',
                selected: state.selectedStamp?.id === 'triangle',
              },
              {
                label: 'Hexagon',
                icon: <HexagonIcon />,
                onClick: () => {
                  helper.stamps.hexagon();
                },
                selected: state.selectedStamp?.id === 'hexagon',
                disabled: false,
              },
            ]}
          >
            <ShapesIcon />
          </CanvasViewerButtonMenu>
        </>
      ) : null}
      {/* @todo single-line mode when its available */}
      {/*<CanvasViewerButton>*/}
      {/*  <HomeIcon title={t('polygons__line', { defaultValue: 'Line' })} />*/}
      {/*</CanvasViewerButton>*/}
      {state.showBoundingBox ? (
        <CanvasViewerButton onClick={() => helper.key.down('Backspace')}>
          <DeleteForeverIcon style={{ color: 'red' }} />
        </CanvasViewerButton>
      ) : null}
    </>
  );

  const controls = document.getElementById('atlas-controls');
  const Shape = 'shape' as any;

  return (
    <>
      <world-object
        height={image.height}
        width={image.width}
        onMouseMove={mouseMove}
        onMouseDown={helper.pointerDown}
        onMouseUp={helper.pointerUp}
        onMouseLeave={helper.blur}
      >
        {props.shape ? (
          <>
            <Shape
              open={props.shape.open}
              points={props.shape.points as any}
              relativeStyle={true}
              style={isStamping ? {} : (theme.outer as any)}
            />
            <Shape
              open={props.shape.open}
              points={props.shape.points as any}
              relativeStyle={true}
              style={isStamping ? {} : (theme.inner as any)}
            />
          </>
        ) : null}
        <HTMLPortal relative={true} interactive={false}>
          <div style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${image.width} ${image.height}`} tabIndex={-1}>
              <defs>{defs}</defs>
              {editor}
            </svg>
          </div>
          {controls ? createPortal(controlsComponent, controls, 'controls') : null}
        </HTMLPortal>
      </world-object>
    </>
  );
}
