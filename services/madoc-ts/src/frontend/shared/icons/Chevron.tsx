import { SVGProps } from 'react';
import * as React from 'react';

export const Chevron = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="1em" width="1em" {...props}>
    <path d="M24 24H0V0h24v24z" fill="none" />
    <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
  </svg>
);
