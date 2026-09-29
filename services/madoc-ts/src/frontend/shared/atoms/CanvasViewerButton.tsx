import React from 'react';

export interface CanvasViewerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'data-active'?: boolean;
}

export function CanvasViewerButton({ className = '', ...props }: CanvasViewerButtonProps) {
  return (
    <button
      className={`madoc-canvas-viewer-button inline-flex cursor-pointer items-center rounded-[3px] border-0 bg-[var(--madoc-viewer-button-background,#fff)] p-[0.65em] text-[1em] text-[var(--madoc-accent-link,#4265e9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--madoc-accent-link,#4265e9)] disabled:cursor-not-allowed disabled:opacity-60 data-[active=true]:bg-[var(--madoc-accent,#4265e9)] data-[active=true]:text-[var(--madoc-accent-text,#fff)] data-[active=true]:disabled:opacity-100 [&_svg]:text-[1.3em] ${className}`}
      {...props}
    />
  );
}
