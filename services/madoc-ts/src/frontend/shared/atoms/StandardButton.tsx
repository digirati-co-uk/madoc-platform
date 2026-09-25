import React from 'react';

interface StandardButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  $size?: 'large' | 'medium' | 'small';
  $variation?: 'primary' | 'secondary' | 'tertiary';
  $stretched?: boolean;
  as?: React.ElementType;
  href?: string;
}

const sizes = {
  large: 'px-[1.2em] py-[0.7em] text-[1.2em]',
  medium: 'px-[1.2em] py-[0.6em] text-[0.95em]',
  small: 'px-[0.8em] py-[0.1em] text-[0.75em]',
};

const variations = {
  primary:
    'border-[var(--madoc-accent,#4265e9)] bg-[var(--madoc-accent,#4265e9)] text-[var(--madoc-accent-text,#fff)] visited:text-[var(--madoc-accent-text,#fff)] hover:brightness-110',
  secondary:
    'border-[var(--madoc-accent,#4265e9)] bg-transparent text-[var(--madoc-accent-link,#4265e9)] visited:text-[var(--madoc-accent-link,#4265e9)] hover:bg-[var(--madoc-accent,#4265e9)] hover:text-[var(--madoc-accent-text,#fff)]',
  tertiary:
    'border-transparent bg-transparent text-[var(--madoc-accent-link,#4265e9)] visited:text-[var(--madoc-accent-link,#4265e9)] hover:bg-[var(--madoc-accent,#4265e9)] hover:text-[var(--madoc-accent-text,#fff)]',
};

export function StandardButton({
  $size = 'medium',
  $variation = 'secondary',
  $stretched,
  as: Component = 'button',
  className = '',
  ...props
}: StandardButtonProps) {
  return (
    <Component
      {...props}
      className={`inline-flex cursor-pointer items-center justify-center border font-normal leading-[22px] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--madoc-accent,#4265e9)] disabled:cursor-not-allowed disabled:opacity-70 ${sizes[$size]} ${variations[$variation]} ${$stretched ? 'w-full' : ''} ${className}`}
    />
  );
}
