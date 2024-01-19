import * as React from 'react';
import { SVGProps } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
export function LineIcon({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" aria-labelledby={titleId} {...props}>
      {title ? <title id={titleId}>{title}</title> : null}
      <g fill="none" fillRule="evenodd">
        <circle cx={4.5} cy={4.5} r={2.5} fill="currentColor" />
        <circle cx={15.5} cy={15.5} r={2.5} fill="currentColor" />
        <path stroke="currentColor" strokeLinecap="square" strokeWidth={2} d="m13.5 13.5-9-9" />
      </g>
    </svg>
  );
}
