import * as React from 'react';
import { SVGProps } from 'react';

export const MinusIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 24 24" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 13H5v-2h14v2z" fill="currentColor" />
    {title ? <title>{title}</title> : null}
  </svg>
);
