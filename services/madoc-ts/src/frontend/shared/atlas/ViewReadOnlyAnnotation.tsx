import { useMemo, useState } from 'react';
import { HTMLPortal } from '@atlas-viewer/atlas';
import { HotSpot } from '../atoms/HotSpot';
import { useSelectorEvents } from '../capture-models/editor/stores/selectors/selector-helper';
import { ReadOnlyAnnotation } from '../hooks/use-read-only-annotations';
import { useCanvas } from 'react-iiif-vault';

// Avoid bad types from Atlas.
const CustomHTMLPortal = HTMLPortal as any;

function isBox(target: any): target is { x: number; y: number; width: number; height: number } {
  return typeof target === 'object' && 'x' in target && 'y' in target && 'width' in target && 'height' in target;
}

function getBounds(target: ReadOnlyAnnotation['target'], { width, height }: { width?: number; height?: number }) {
  if (isBox(target)) {
    return target;
  }

  if (target && target.shape && target.shape.points) {
    const x = target.shape.points.map((p: any) => p[0]);
    const y = target.shape.points.map((p: any) => p[1]);
    return {
      x: Math.min(...x),
      y: Math.min(...y),
      width: Math.max(...x) - Math.min(...x),
      height: Math.max(...y) - Math.min(...y),
    };
  }

  return { x: 0, y: 0, width: 0, height: 0 };
}

export function ViewReadOnlyAnnotation({ id, style, target: originalTarget, ...props }: ReadOnlyAnnotation) {
  const canvas = useCanvas();
  const { onClick, onHover } = useSelectorEvents(id);
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const { interactive, hotspot, hotspotSize, hidden: _, ...allStyles } = style;

  const styleToApply = useMemo(() => {
    if (hotspot) {
      const { ':hover': hoverStyles, ':active': activeStyles, ...styles } = allStyles;
      return isOpen ? activeStyles : isHover ? hoverStyles : styles;
    }
    return allStyles;
  }, [allStyles, hotspot, isHover, isOpen]);

  if (!canvas) {
    return null;
  }

  const target = getBounds(originalTarget, canvas);

  const Shape = 'shape' as any;
  const Box = 'box' as any;

  const getShape = () => {
    if (!originalTarget || !target) {
      return null;
    }

    if (isBox(originalTarget)) {
      return (
        <Box
          id={`${hotspot ? 'hotspot' : 'non-hotspot'}/box-${id}`}
          html
          interactive={interactive}
          {...props}
          style={styleToApply}
          target={{ x: 0, y: 0, width: target.width, height: target.height }}
          onClick={onClick}
          onMouseEnter={onHover}
        />
      );
    }

    return (
      <Shape
        id={`${hotspot ? 'hotspot' : 'non-hotspot'}/shape-${id}`}
        points={originalTarget.shape.points.map(p => [p[0] - target.x, p[1] - target.y])}
        open={originalTarget.shape.open}
        relativeStyle={true}
        {...props}
        style={style}
        target={{ x: 0, y: 0, width: target.width, height: target.height }}
        onClick={onClick}
        onMouseEnter={onHover}
      />
    );
  };

  return (
    <world-object id={`readonly-${id}`} x={target.x} y={target.y} width={target.width} height={target.height}>
      {hotspot ? (
        <>
          {getShape()}

          <CustomHTMLPortal
            id={`portal/${id}`}
            relativeStyle
            relativeSize={false}
            interactive
            target={{ x: 0, y: 0, width: target.width, height: target.height }}
            style={{ overflow: 'visible' }}
          >
            <HotSpot
              $size={hotspotSize || 'lg'}
              $active={isOpen}
              onClick={() => setIsOpen(o => !o)}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            />
          </CustomHTMLPortal>
        </>
      ) : (
        getShape()
      )}
    </world-object>
  );
}
