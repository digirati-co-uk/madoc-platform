import React, { ComponentPropsWithoutRef, forwardRef } from 'react';

export const Header = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function Header(
  { className, ...props },
  ref
) {
  return <div {...props} ref={ref} className={`mt-[0.5em] mb-[2.5em]${className ? ` ${className}` : ''}`} />;
});

export const ContextHeading = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function ContextHeading(
  { className, ...props },
  ref
) {
  return (
    <div
      {...props}
      ref={ref}
      className={`text-xs [&~.madoc-heading-1]:mt-[0.3em]${className ? ` ${className}` : ''}`}
    />
  );
});
