import * as React from 'react';
import { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}

export function LineBoxIcon({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h20v20H0z" />
        <path stroke="currentColor" strokeLinecap="square" strokeWidth={2} d="m8.5 11.5 6-6M16 4v3m0-3h-3m0 14L2 7" />
        <path stroke="currentColor" strokeOpacity={0.407} strokeWidth={2} d="m2 7 5-5 11 11-5 5z" />
      </g>
    </svg>
  );
}
