import React from 'react';

type VerticalResizeSeparatorProps = {
  ariaLabel: string;
  onResizeStart: (event: React.MouseEvent<HTMLDivElement>) => void;
  onHoverChange?: (isHover: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function VerticalResizeSeparator({
  ariaLabel,
  onResizeStart,
  onHoverChange,
  className,
  style,
  children,
}: VerticalResizeSeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={ariaLabel}
      onMouseDown={onResizeStart}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
