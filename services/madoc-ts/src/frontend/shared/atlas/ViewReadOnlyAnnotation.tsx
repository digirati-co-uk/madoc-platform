import React, { useMemo, useState } from 'react';
import { HTMLPortal, mergeStyles } from '@atlas-viewer/atlas';
import { HotSpot } from '../atoms/HotSpot';
import { ReadOnlyAnnotation } from '../hooks/use-read-only-annotations';

// Avoid bad types from Atlas.
const CustomHTMLPortal = HTMLPortal as any;

export function ViewReadOnlyAnnotation({ style, ...props }: ReadOnlyAnnotation) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const { interactive, hotspot, hotspotSize, hidden, ...allStyles } = style;

  const styleToApply = useMemo(() => {
    if (hotspot) {
      const { ':hover': hoverStyles, ':active': activeStyles, ...styles } = allStyles;
      return isOpen ? mergeStyles(styles, activeStyles) : isHover ? mergeStyles(styles, hoverStyles) : styles;
    }
    return allStyles;
  }, [allStyles, hotspot, isHover, isOpen]);

  if (hotspot) {
    return (
      <>
        <box interactive={interactive} {...props} style={styleToApply} />
        <CustomHTMLPortal
          relativeStyle
          relativeSize={false}
          interactive
          target={props.target}
          style={{ overflow: 'visible' }}
        >
          <HotSpot
            $size={hotspotSize || 'md'}
            $active={isOpen}
            onClick={() => setIsOpen(o => !o)}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          />
        </CustomHTMLPortal>
      </>
    );
  }

  return <box interactive={interactive} {...props} style={styleToApply} />;
}
