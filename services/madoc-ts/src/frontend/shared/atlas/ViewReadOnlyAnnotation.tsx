import React, { useEffect, useMemo, useState } from 'react';
import { HTMLPortal, mergeStyles, useAtlas } from '@atlas-viewer/atlas';
import { HotSpot } from '../atoms/HotSpot';
import { useSelectorEvents } from '../capture-models/editor/stores/selectors/selector-helper';
import { ReadOnlyAnnotation } from '../hooks/use-read-only-annotations';

// Avoid bad types from Atlas.
const CustomHTMLPortal = HTMLPortal as any;

export function ViewReadOnlyAnnotation({ id, style, target, ...props }: ReadOnlyAnnotation) {
  const { onClick } = useSelectorEvents(id);
  const [isOpen, setIsOpen] = useState(false);
  const atlas = useAtlas();
  const [isHover, setIsHover] = useState(false);
  const { interactive, hotspot, hotspotSize, hidden, ...allStyles } = style;

  const styleToApply = useMemo(() => {
    if (hotspot) {
      const { ':hover': hoverStyles, ':active': activeStyles, ...styles } = allStyles;
      return isOpen ? activeStyles : isHover ? hoverStyles : styles;
    }

    return allStyles;
  }, [allStyles, hotspot, isHover, isOpen]);

  return (
    <world-object
      id={`readonly-${id}`}
      x={target.x}
      y={target.y}
      width={target.width}
      height={target.height}
      onClick={() => {
        console.log('ON CLICK');
        onClick();
      }}
    >
      {hotspot ? (
        <>
          <box
            id={`hotspot/${id}`}
            html
            interactive={interactive}
            {...props}
            style={styleToApply}
            target={{ x: 0, y: 0, width: target.width, height: target.height }}
          />
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
        <box
          id={`non-hotspot/${id}`}
          html
          interactive={interactive}
          {...props}
          style={styleToApply}
          target={{ x: 0, y: 0, width: target.width, height: target.height }}
        />
      )}
    </world-object>
  );
}
