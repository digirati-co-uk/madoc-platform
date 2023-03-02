import { HTMLPortal, useResizeWorldItem } from '@atlas-viewer/atlas';
import React, { CSSProperties, ReactNode, useMemo } from 'react';

type ResizeWorldItemProps = JSX.IntrinsicElements['worldObject'] & {
  handleSize?: number;
  resizable?: boolean;
  onSave: (pos: Partial<{ x: number; y: number; width: number; height: number }>) => void;
  children?: ReactNode;
  maintainAspectRatio?: boolean;
  disableCardinalControls?: boolean;
};

export function ResizeWorldItem({
  handleSize: _handleSize,
  resizable,
  onSave,
  children,
  maintainAspectRatio,
  disableCardinalControls,
  ...props
}: ResizeWorldItemProps) {
  const handleSize = typeof _handleSize === 'undefined' ? (maintainAspectRatio ? 10 : 8) : _handleSize;
  const { portalRef, mode, mouseEvent, isEditing } = useResizeWorldItem(
    { x: props.x || 0, y: props.y || 0, width: props.width, height: props.height, maintainAspectRatio },
    onSave
  );
  const translate = useMemo(() => mouseEvent('translate'), [mouseEvent]);
  const east = useMemo(() => mouseEvent('east'), [mouseEvent]);
  const west = useMemo(() => mouseEvent('west'), [mouseEvent]);
  const south = useMemo(() => mouseEvent('south'), [mouseEvent]);
  const north = useMemo(() => mouseEvent('north'), [mouseEvent]);
  const southEast = useMemo(() => mouseEvent('south-east'), [mouseEvent]);
  const southWest = useMemo(() => mouseEvent('south-west'), [mouseEvent]);
  const northEast = useMemo(() => mouseEvent('north-east'), [mouseEvent]);
  const northWest = useMemo(() => mouseEvent('north-west'), [mouseEvent]);

  const inSketchMode = mode === 'sketch';
  const baseStyle: CSSProperties = {
    zIndex: 999,
    boxShadow: '0px 2px 3px 0 rgba(0,0,0,0.2)',
    border: '1px solid rgba(155,155,155,.7)',
    borderRadius: maintainAspectRatio || disableCardinalControls ? '50%' : 2,
    position: 'absolute',
    background: '#fff',
    pointerEvents: isEditing ? 'none' : inSketchMode ? 'initial' : 'none',
  };

  return (
    <>
      <world-object {...props}>
        {children}

        {inSketchMode && resizable ? (
          <HTMLPortal
            ref={portalRef}
            target={{ x: 0, y: 0, height: props.height, width: props.width }}
            relative={true}
            interactive={false}
          >
            {inSketchMode && resizable ? (
              <>
                <div
                  onMouseDown={translate}
                  onTouchStart={translate}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    border: '1px solid rgba(155,155,155, .7)',
                    boxSizing: 'border-box',
                    pointerEvents: isEditing ? 'none' : inSketchMode ? 'initial' : 'none',
                  }}
                />

                {!maintainAspectRatio ? (
                  <>
                    <div
                      title="east"
                      onTouchStart={east}
                      onMouseDown={east}
                      style={{
                        ...baseStyle,
                        cursor: 'e-resize',
                        height: handleSize * 2,
                        width: handleSize,
                        right: 0,
                        top: '50%',
                        opacity: disableCardinalControls ? 0 : 1,
                        transform: `translate(${handleSize / 2}px, -${handleSize}px)`,
                      }}
                    />
                    <div
                      title="west"
                      onMouseDown={west}
                      style={{
                        ...baseStyle,
                        cursor: 'w-resize',
                        position: 'absolute',
                        height: handleSize * 2,
                        width: handleSize,
                        left: 0,
                        top: '50%',
                        opacity: disableCardinalControls ? 0 : 1,
                        transform: `translate(-${handleSize / 2}px, -${handleSize}px)`,
                      }}
                    />

                    <div
                      title="north"
                      onMouseDown={north}
                      style={{
                        ...baseStyle,
                        cursor: 'n-resize',
                        position: 'absolute',
                        height: handleSize,
                        width: handleSize * 2,
                        left: '50%',
                        top: 0,
                        opacity: disableCardinalControls ? 0 : 1,
                        transform: `translate(-${handleSize}px, -${handleSize / 2}px)`,
                      }}
                    />

                    <div
                      title="south"
                      onMouseDown={south}
                      style={{
                        ...baseStyle,
                        cursor: 's-resize',
                        position: 'absolute',
                        height: handleSize,
                        width: handleSize * 2,
                        left: '50%',
                        bottom: 0,
                        opacity: disableCardinalControls ? 0 : 1,
                        transform: `translate(-${handleSize}px, ${handleSize / 2}px)`,
                      }}
                    />
                  </>
                ) : null}

                <div
                  title="north-east"
                  onMouseDown={northEast}
                  style={{
                    ...baseStyle,
                    cursor: 'ne-resize',
                    position: 'absolute',
                    height: handleSize,
                    width: handleSize,
                    right: 0,
                    top: 0,
                    transform: `translate(${handleSize / 2}px, -${handleSize / 2}px)`,
                  }}
                />

                <div
                  title="south-east"
                  onMouseDown={southEast}
                  style={{
                    ...baseStyle,
                    cursor: 'se-resize',
                    position: 'absolute',
                    height: handleSize,
                    width: handleSize,
                    bottom: 0,
                    right: 0,
                    transform: `translate(${handleSize / 2}px, ${handleSize / 2}px)`,
                  }}
                />

                <div
                  title="south-west"
                  onMouseDown={southWest}
                  style={{
                    ...baseStyle,
                    cursor: 'sw-resize',
                    position: 'absolute',
                    height: handleSize,
                    width: handleSize,
                    bottom: 0,
                    left: 0,
                    transform: `translate(-${handleSize / 2}px, ${handleSize / 2}px)`,
                  }}
                />

                <div
                  title="north-west"
                  onMouseDown={northWest}
                  style={{
                    ...baseStyle,
                    cursor: 'nw-resize',
                    position: 'absolute',
                    height: handleSize,
                    width: handleSize,
                    top: 0,
                    left: 0,
                    transform: `translate(-${handleSize / 2}px, -${handleSize / 2}px)`,
                  }}
                />
              </>
            ) : null}
          </HTMLPortal>
        ) : null}
      </world-object>
    </>
  );
}
