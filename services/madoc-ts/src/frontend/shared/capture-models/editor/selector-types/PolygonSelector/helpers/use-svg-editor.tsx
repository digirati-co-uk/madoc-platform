import { useEffect, useRef, useState } from 'react';
import { useHelper } from './use-helper';
import { createSvgHelpers, InputShape, RenderState, SlowState } from 'polygon-editor';

const svgHelpers = createSvgHelpers();

interface SvgEditorOptions {
  image: { height: number; width: number };
  currentShape: InputShape | null;
  onChange: (e: InputShape) => void;
  hideShapeLines?: boolean;
}

export function useSvgEditor(options: SvgEditorOptions, deps: any[]) {
  const { image, currentShape, onChange, hideShapeLines } = options;
  const boundingBox = useRef<any>();
  const transitionBoundingBox = useRef<any>();
  const selectBox = useRef<any>();
  const hint = useRef<any>();
  const transitionDraw = useRef<any>();
  const transitionShape = useRef<any>();
  const pointLine = useRef<any>();
  const lineBox = useRef<any>();
  const [transitionDirection, setTransitionDirection] = useState<string | null>(null);
  const [transitionRotate, setTransitionRotate] = useState<boolean>(false);
  const { helper, state } = useHelper(
    currentShape,
    (renderState: RenderState, slowState: SlowState) => {
      svgHelpers.updateTransitionBoundingBox(transitionBoundingBox.current, renderState, slowState);
      svgHelpers.updateBoundingBoxPolygon(boundingBox.current, renderState, slowState);
      svgHelpers.updateTransitionShape(transitionShape.current, renderState, slowState);
      svgHelpers.updateClosestLinePointTransform(hint.current, renderState, slowState);
      svgHelpers.updateSelectBox(selectBox.current, renderState, slowState);
      svgHelpers.updatePointLine(pointLine.current, renderState, slowState);
      svgHelpers.updateDrawPreview(transitionDraw.current, renderState, slowState, 3);
      svgHelpers.updateLineBox(lineBox.current, renderState);
      setTransitionDirection(renderState.transitionDirection);
      setTransitionRotate(renderState.transitionRotate);
    },
    onChange
  );

  useEffect(() => {
    helper.setShape(currentShape || null);
  }, deps);

  useEffect(() => {
    const windowBlur = () => {
      helper.modifiers.reset();
    };
    document.addEventListener('mouseleave', windowBlur);
    return () => {
      document.removeEventListener('mouseleave', windowBlur);
    };
  }, []);

  // @todo Paste
  // useEffect(() => {
  //   const onPaste = async (e: any) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //
  //     const paste = (e.clipboardData || (window as any).clipboardData).getData('text');
  //
  //     const parsed = parseSelector({
  //       type: 'SvgSelector',
  //       value: paste,
  //     });
  //     try {
  //       if (parsed.selector && parsed.selector.type === 'SvgSelector') {
  //         const points = parsed.selector.points;
  //         if (points) {
  //           // 1. We need to translate all the points to 0,0
  //           let x = Math.min(...points.map(p => p[0]));
  //           let y = Math.min(...points.map(p => p[1]));
  //           const maxX = Math.max(...points.map(p => p[0]));
  //           const maxY = Math.max(...points.map(p => p[1]));
  //           const width = maxX - x;
  //           const height = maxY - y;
  //
  //           if (helper.state.pointer) {
  //             x -= helper.state.pointer[0] - width / 2;
  //             y -= helper.state.pointer[1] - height / 2;
  //           }
  //           const newPoints: [number, number][] = points.map(p => [p[0] - x, p[1] - y]);
  //
  //           helper.setShape({
  //             points: newPoints,
  //             open: false,
  //           });
  //         }
  //       }
  //     } catch (e) {
  //       console.log('Error parsing pasted svg');
  //       console.error(e);
  //     }
  //   };
  //
  //   window.addEventListener('paste', onPaste);
  //   return () => {
  //     window.removeEventListener('paste', onPaste);
  //   };
  // }, []);

  // @todo Copy
  // useEffect(() => {
  //   const onCopy = async (e: any) => {
  //     if (!helper.state.polygon.points.length) {
  //       return;
  //     }
  //     e.clipboardData.setData(
  //       'text/plain',
  //       `<svg  width="${image.width}" height="${image.height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
  //         image.width
  //       } ${image.height}"><g><polygon points="${helper.state.polygon.points
  //         .map(r => r.join(','))
  //         .join(' ')}" /></g></svg>`
  //     );
  //     e.preventDefault();
  //   };
  //
  //   window.addEventListener('copy', onCopy);
  //   return () => {
  //     window.removeEventListener('copy', onCopy);
  //   };
  // }, []);

  // Default styles for markers.
  const defs = (
    <>
      {/* Marker */}
      <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <circle cx="5" cy="5" r="4" className="marker" />
      </marker>
      <marker id="selected" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <circle cx="5" cy="5" r="4" fill="#FAFF00" />
      </marker>
      <marker id="resizer" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
        <rect width="10" height="10" stroke="#FF0DCB" fill="#fff" strokeWidth={2} />
      </marker>
    </>
  );

  const Shape = currentShape ? (currentShape.open ? 'polyline' : 'polygon') : null;
  const isHoveringPoint =
    !state.showBoundingBox && state.closestPoint !== null && state.actionIntentType === 'select-point';
  const isAddingPoint = state.actionIntentType === 'add-open-point';
  const isSplitting = state.transitionIntentType === 'split-line';

  const isStamping = state.transitioning && state.selectedStamp && state.transitionIntentType === 'stamp-shape';

  const editor =
    currentShape && Shape ? (
      <>
        <Shape
          fill={
            !state.transitioning && /*state.pointerInsideShape || */ state.showBoundingBox
              ? 'rgba(255, 0, 0, .5)'
              : 'none'
          }
          strokeWidth={isStamping ? 0 : 2}
          stroke={hideShapeLines ? 'transparent' : '#000'}
          points={currentShape.points.map(r => r.join(',')).join(' ')}
          vectorEffect="non-scaling-stroke"
          markerStart={!state.showBoundingBox ? 'url(#dot)' : undefined}
          markerMid={!state.showBoundingBox ? 'url(#dot)' : undefined}
          markerEnd={!state.showBoundingBox ? 'url(#dot)' : undefined}
          style={{ pointerEvents: 'none' }}
        />

        {state.lineBoxMode && state.actionIntentType === 'close-line-box' ? (
          <polygon
            fill="rgba(255, 0, 0, .4)"
            ref={lineBox}
            stroke="#000"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {state.transitionIntentType === 'draw-shape' && state.transitioning ? (
          <polyline
            ref={transitionDraw}
            fill="none"
            stroke="rgba(255, 0, 0, .5)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        {!state.showBoundingBox && state.selectedPoints && state.selectedPoints.length ? (
          <polyline
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            stroke="transparent"
            markerStart="url(#selected)"
            markerMid="url(#selected)"
            markerEnd="url(#selected)"
            fill="transparent"
            points={currentShape.points
              .filter((p, idx) => state.selectedPoints?.includes(idx))
              .map(r => r.join(','))
              .join(' ')}
          />
        ) : null}

        {isHoveringPoint && state.closestPoint !== null && currentShape.points[state.closestPoint] ? (
          <polyline
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            stroke="transparent"
            markerStart="url(#selected)"
            markerMid="url(#selected)"
            markerEnd="url(#selected)"
            fill="transparent"
            points={`${currentShape.points[state.closestPoint][0]},${currentShape.points[state.closestPoint][1]}`}
          />
        ) : null}

        {!state.transitioning &&
        (state.actionIntentType === 'add-open-point' ||
          state.actionIntentType === 'close-shape' ||
          state.actionIntentType === 'close-shape-line') ? (
          <polyline
            stroke="#000"
            ref={pointLine}
            strokeWidth={state.actionIntentType === 'close-shape' ? 2 : 1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {state.hasClosestLine && (!state.transitionIntentType || state.transitionIntentType === 'split-line') ? (
          <g ref={hint}>
            <polyline
              style={{ opacity: 0.5 }}
              markerStart="url(#dot)"
              points="0,0 10,10"
              vectorEffect="non-scaling-stroke"
              fill="transparent"
              strokeWidth={2}
            />
          </g>
        ) : null}
        {state.transitioning ? (
          <Shape
            ref={transitionShape}
            fill={currentShape.open ? 'none' : 'rgba(255, 0, 0, .5)'}
            stroke="rgba(255, 0, 0, .5)"
            strokeWidth={currentShape.open ? 2 : 0}
          />
        ) : null}
        {state.transitioning && state.transitionIntentType === 'select-multiple-points' ? (
          <rect
            ref={selectBox}
            fill="rgba(255, 255, 255, .3)"
            strokeWidth={1}
            stroke="rgba(0,0,0,.2)"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {!state.showBoundingBox ? (
          <g name="controls">
            {(false as boolean) &&
              currentShape.points.map((point, key) => {
                const selectedBounds = null;
                const isActive = (state.selectedPoints || []).includes(key);

                return (
                  <circle
                    className={`controls ${isActive ? 'controls--selected' : ''}${
                      selectedBounds ? ' controls--bounds' : ''
                    }`}
                    key={key}
                    cx={`${(point[0] / image.width) * 100}%`}
                    cy={`${(point[1] / image.height) * 100}%`}
                    r={isActive && selectedBounds ? 3 : 5}
                  />
                );
              })}
          </g>
        ) : null}
        {state.showBoundingBox && !isStamping ? (
          <polygon
            ref={boundingBox}
            strokeWidth={2}
            stroke="#FF0DCB"
            fill="none"
            markerStart="url(#resizer)"
            markerMid="url(#resizer)"
            markerEnd="url(#resizer)"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </>
    ) : null;

  return {
    helper,
    state,
    isAddingPoint,
    isSplitting,
    isStamping,
    isHoveringPoint,
    transitionDirection,
    transitionRotate,
    defs,
    editor,
  };
}
