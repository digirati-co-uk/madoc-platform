import React, { KeyboardEvent, MutableRefObject, Ref } from 'react';
import { useResizeLayout, getResizeLayoutWidths } from '../hooks/use-resize-layout';
import ResizeHandleIcon from '../icons/ResizeHandleIcon';
import { LayoutHandle } from '../layout/LayoutContainer';
import { ButtonIcon } from '../navigation/Button';

export interface HorizontalEditorSplitProps {
  name: string;
  enabled: boolean;
  resizableSide: 'left' | 'right';
  flexiblePane: React.ReactNode;
  resizablePane: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  containerRef?: Ref<HTMLDivElement>;
  className?: string;
  flexiblePaneClassName?: string;
  resizablePaneClassName?: string;
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

export function HorizontalEditorSplit({
  name,
  enabled,
  resizableSide,
  flexiblePane,
  resizablePane,
  defaultWidth = 420,
  minWidth = 280,
  containerRef,
  className = '',
  flexiblePaneClassName = '',
  resizablePaneClassName = '',
}: HorizontalEditorSplitProps) {
  const { widthB, setWidths, refs } = useResizeLayout(name, {
    left: resizableSide === 'left',
    widthB: `${defaultWidth}px`,
    minWidthPx: minWidth,
    maxWidthPct: 0.8,
    onDragEnd: () => window.dispatchEvent(new Event('resize')),
  });
  const currentWidth = Number.parseFloat(widthB) || defaultWidth;
  const containerWidth = refs.container.current?.getBoundingClientRect().width;
  const maximumWidth = containerWidth ? containerWidth * 0.8 : undefined;

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const containerWidth = refs.container.current?.getBoundingClientRect().width;
    if (!containerWidth) {
      return;
    }

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const sideDirection = resizableSide === 'left' ? direction : -direction;
    setWidths(
      getResizeLayoutWidths(
        containerWidth,
        (currentWidth + sideDirection * 16) / containerWidth,
        minWidth,
        containerWidth * 0.8
      )
    );
    window.dispatchEvent(new Event('resize'));
  };

  const handle = enabled ? (
    <LayoutHandle
      ref={refs.resizer as React.Ref<HTMLDivElement>}
      role="separator"
      aria-label="Resize editor panel"
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={maximumWidth}
      aria-valuenow={Math.round(currentWidth)}
      tabIndex={0}
      onKeyDown={resizeWithKeyboard}
    >
      <ButtonIcon>
        <ResizeHandleIcon />
      </ButtonIcon>
    </LayoutHandle>
  ) : null;

  const flexible = (
    <div
      ref={refs.otherDiv as React.Ref<HTMLDivElement>}
      className={`flex h-full min-h-0 min-w-0 flex-1 ${flexiblePaneClassName}`}
    >
      {flexiblePane}
    </div>
  );
  const resizable = (
    <div
      ref={refs.resizableDiv as React.Ref<HTMLDivElement>}
      className={`flex h-full min-h-0 min-w-0 shrink-0 overflow-auto ${resizablePaneClassName}`}
      style={{ width: enabled ? widthB : defaultWidth, maxWidth: enabled ? '80%' : undefined }}
    >
      {resizablePane}
    </div>
  );

  return (
    <div
      ref={element => {
        refs.container.current = element || undefined;
        setRef(containerRef, element);
      }}
      className={`flex h-full max-h-full min-h-0 w-full min-w-0 ${className}`}
    >
      {resizableSide === 'left' ? resizable : flexible}
      {handle}
      {resizableSide === 'left' ? flexible : resizable}
    </div>
  );
}
